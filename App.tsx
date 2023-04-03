import { ariesAskar } from '@hyperledger/aries-askar-react-native'
import { anoncreds } from '@hyperledger/anoncreds-react-native'
import { AnonCredsCredentialDefinition, AnonCredsSchema } from '@aries-framework/anoncreds'
import React, { useEffect, useState } from 'react'
import { Button, SafeAreaView, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native'
import fullAnoncredsRsFlowTest from './anoncredsTest'
import { Colors } from 'react-native/Libraries/NewAppScreen'
import { agent } from './agent'
import { ConnectionRecord, CredentialExchangeRecord } from '@aries-framework/core'

const AgentView = ({}) => {
  const isDarkMode = useColorScheme() === 'dark'
  const [isInitializing, setIsInitializing] = useState(false)
  const [versions, setVersions] = useState('')
  const [connections, setConnections] = useState<ConnectionRecord[]>([])
  const [credentials, setCredentials] = useState<CredentialExchangeRecord[]>([])
  const [schema, setSchema] = useState<string>()
  const [credDef, setCredDef] = useState<string>()
  const [linkSecrets, setLinkSecrets] = useState<string[]>()
  const [dids, setDids] = useState<string[]>([])
  const [resolvedResult, setResolvedResult] = useState<any>()

  useEffect(() => {
    console.log({
      askar: ariesAskar.version(),
      anoncreds: anoncreds.version(),
    })
    setVersions(`askar: ${ariesAskar.version()} anoncreds: ${anoncreds.version()}`)
    if (isInitializing) return
    setIsInitializing(true)

    agent
      .initialize()
      .then(async () => {
        setIsInitializing(false)
      })
      .catch((e) => {
        console.log('error hier', e.stack)
      })
  }, [])

  useEffect(() => {
    let clear: ReturnType<typeof setInterval> | undefined = undefined

    async function run() {
      // set connections and credentials every 2 seconds
      clear = setInterval(async () => {
        const connections = await agent.connections.getAll()
        setConnections(connections)
        const credentials = await agent.credentials.getAll()
        setCredentials(credentials)
        const dids = (await agent.dids.getCreatedDids({method: 'cheqd'})).map((didRecord)=>didRecord.did)

        setDids(dids)
      }, 2000)

      // get schema
      // const registry = new IndyVdrAnonCredsRegistry()
      // const schemaResult = await registry.getSchema(agent.context, 'Y6LRXGU3ZCpm7yzjVRSaGu:2:VerifiedEmail:1.0')
      // if (schemaResult.schema) setSchema(schemaResult.schema)

      // create link secret
      await agent.modules.anoncreds.createLinkSecret()
      const linkSecretIds = await agent.modules.anoncreds.getLinkSecretIds()
      setLinkSecrets(linkSecretIds)
    }
    if (!isInitializing && agent.isInitialized) {
      run()

      return () => {
        if (clear) clearInterval(clear)
      }
    }
  }, [isInitializing])

  async function createDid() {
    const didResult = await agent.dids.create({
        method: 'cheqd',
        secret: {
          verificationMethod: {
            id: 'key-11',
            type: 'JsonWebKey2020',
          },
        },
        options: {
          network: 'testnet',
          methodSpecificIdAlgo: 'base58btc',
        },
      })
      if(didResult.didState.did) {
        setDids([...dids, didResult.didState.did])
      }
  }

  async function createSchemaAndCredDef() {
    const cheqdDid = dids[dids.length - 1]
    const dynamicVersion = `1.${Math.random() * 100}`
    if(cheqdDid) {
        const schemaResult = await agent.modules.anoncreds.registerSchema({
            schema: {
                attrNames: ['name', 'age'],
                issuerId: cheqdDid,
                name: 'Person',
                version: dynamicVersion,
            },
            options: {},
        })
        setSchema(schemaResult.schemaState.schemaId || '')
        const credDefResult = await agent.modules.anoncreds.registerCredentialDefinition({
            credentialDefinition: {
                issuerId: cheqdDid,
                tag: 'DrivingLicense',
                schemaId: schemaResult.schemaState.schemaId!,
            },
            options: {}
        })
        console.log(credDefResult)
        setCredDef(credDefResult.credentialDefinitionState.credentialDefinitionId || '')
      }
  }

  async function resolveDid(id: string) {
    setResolvedResult(await agent.dids.resolve(id))
  }

  async function resolveSchema(id: string){
    setResolvedResult(await agent.modules.anoncreds.getSchema(id))
  }

  async function resolveCredDef(id: string){
    setResolvedResult(await agent.modules.anoncreds.getCredentialDefinition(id))
  }

  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}
      >
        AFJ x CHEQD
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}
      >
        {versions}
      </Text>
      <Text />
      <Text />
      <Button
        onPress={createDid}
        title="Create DID"
        color="#841584"
      />
      <Text />
      <Text />
      <Button
        onPress={createSchemaAndCredDef}
        title="Create Schema and CredDef"
        color="#841584"
      />
      {connections.length > 0 && <Text style={{ color: 'green' }}>Connections (Askar Check)</Text>}
      {connections.map((c) => (
        <Text style={{ marginTop: 3 }} key={c.id}>
          {c.id.substring(0, 4)} - {c.theirLabel}
        </Text>
      ))}
      <Text />
      {credentials.length > 0 && <Text style={{ color: 'green' }}>Credentials (AnonCreds Check)</Text>}
      {credentials.map((c) => (
        <Text style={{ marginTop: 3 }} key={c.id}>
          {c.id.substring(0, 4)} - {c.state}
        </Text>
      ))}
      <Text />
      {schema && (
        <Text onPress={()=>resolveSchema(schema)}>
          <Text style={{ color: 'green' }}>Schema (Indy VDR Check){'\n'}</Text>
          {schema}
        </Text>
      )}
      {credDef && (
        <Text onPress={()=>resolveCredDef(credDef)}>
          <Text style={{ color: 'green' }}>Schema (Indy VDR Check){'\n'}</Text>
          {credDef}
        </Text>
      )}
      {linkSecrets && (
        <Text>
          <Text style={{ color: 'green' }}>Link Secrets (AnonCreds Check){'\n'}</Text>
          {JSON.stringify(linkSecrets, null, 2)}
        </Text>
      )}
      {dids && (
        dids.map((DID)=><Text onPress={()=>resolveDid(DID)} key={DID}>
          <Text style={{ color: 'green' }}>DIDs (AnonCreds Cheqd){'\n'}</Text>
          {DID}
        </Text>)
      )}
      { resolvedResult && (
        <Text onLongPress={()=>setResolvedResult(null)}>
        <Text style={{ color: 'green' }}>DIDs (AnonCreds Cheqd){'\n'}</Text>
        {JSON.stringify(resolvedResult, null, 2)}
        </Text>
      )
      }
    </View>
  )
}

const App = () => {
  const isDarkMode = useColorScheme() === 'dark'

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  }

  return (
    <SafeAreaView style={backgroundStyle}>
    <ScrollView>
      <AgentView />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
})

export default App
