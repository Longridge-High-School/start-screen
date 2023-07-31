export const createTimings = () => {
  const timings: {key: string; description: string; duration: number}[] = []

  const time = async <Result>(
    key: string,
    description: string,
    fn: () => Promise<Result>
  ): Promise<Result> => {
    const start = performance.now()
    try {
      return fn()
    } finally {
      const duration = performance.now() - start
      timings.push({key, description, duration})
    }
  }

  const getHeader = () => {
    return timings
      .reverse()
      .map(({key, description, duration}) => {
        return `${key};desc=${JSON.stringify(description)};dur=${duration}`
      })
      .join(',')
  }

  return {time, getHeader}
}

export const combineServerTimingHeaders = (
  headers1: Headers,
  headers2: Headers
) => {
  const newHeaders = new Headers(headers1)
  newHeaders.append('Server-Timing', headers2.get('Server-Timing') ?? '')
  return newHeaders
}
