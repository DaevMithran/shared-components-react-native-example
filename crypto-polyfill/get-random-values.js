// INSECURE GET RANDOM VALUES
// DO NOT USE IN PRODUCTION

const MAX_RANDOM_BYTES = 65536

export default function getRandomValues(values) {
  if (arguments.length < 1) {
    throw new TypeError(
      `An ArrayBuffer view must be specified as the destination for the random values`
    )
  }
  if (
    !(values instanceof Int8Array) &&
    !(values instanceof Uint8Array) &&
    !(values instanceof Int16Array) &&
    !(values instanceof Uint16Array) &&
    !(values instanceof Int32Array) &&
    !(values instanceof Uint32Array) &&
    !(values instanceof Uint8ClampedArray)
  ) {
    throw new TypeError(
      `The provided ArrayBuffer view is not an integer-typed array`
    )
  }
  if (values.byteLength > MAX_RANDOM_BYTES) {
    throw new QuotaExceededError(
      `The ArrayBuffer view's byte length (${values.byteLength}) exceeds the number of bytes of entropy available via this API (${MAX_RANDOM_BYTES})`
    )
  }
  return getRandomValuesInsecure(values)
}
export function getRandomValuesInsecure(values) {
  const byteView = new Uint8Array(
    values.buffer,
    values.byteOffset,
    values.byteLength
  )
  for (let i = 0; i < byteView.length; i++) {
    byteView[i] = Math.random() * 256
  }
  return values
}
class QuotaExceededError extends Error {
  name = 'QuotaExceededError'
  code = 22
}
