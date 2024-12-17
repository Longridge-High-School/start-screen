import {json, type LoaderFunction} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {keyValue} from '@arcath/utils'

export const loader: LoaderFunction = ({request}) => {
  const {headers} = request

  const reqHeaders: {[key: string]: any} = {}

  headers.forEach((k, v) => {
    reqHeaders[v] = k
  })

  return json({reqHeaders})
}

const DebugPage = () => {
  const {reqHeaders} = useLoaderData() as {
    reqHeaders: {[header: string]: string}
  }

  return (
    <div className="bg-white w-1/2 rounded-xl shadow p-2 m-auto mt-4">
      <h1 className="text-3xl">Debug Headers</h1>
      <p>
        These are all the request headers received through by the app.{' '}
        <i>azure-upn</i> should contain the username and <i>azure-group</i>{' '}
        should contain the groups.
      </p>
      <table className="w-full text-left">
        <thead>
          <tr>
            <th scope="col" className="px-6 py-3">
              Header
            </th>
            <th scope="col" className="px-6 py-3">
              Value
            </th>
          </tr>
        </thead>
        <tbody>
          {keyValue(reqHeaders).map(({key, value}, i) => {
            let className = ''

            if (i % 2 === 0) {
              className += 'bg-gray-50'
            }

            return (
              <tr key={key} className={className}>
                <th scope="row">{key}</th>
                <td>{value}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default DebugPage
