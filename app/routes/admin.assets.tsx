import {
  type LoaderFunctionArgs,
  json,
  unstable_parseMultipartFormData,
  unstable_composeUploadHandlers,
  unstable_createFileUploadHandler,
  unstable_createMemoryUploadHandler,
  type ActionFunctionArgs,
  redirect
} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import fs from 'fs'
import path from 'path'
import {invariant} from '@arcath/utils'

import {getUserFromUPN, getUPNFromHeaders} from '~/lib/user.server'

import {
  fieldsetClasses,
  inputClasses,
  labelClasses,
  labelSpanClasses,
  labelInfoClasses,
  buttonClasses
} from '~/lib/classes'

const {readdir, unlink} = fs.promises

const assetsDir = path.join(process.cwd(), 'public', 'assets')

export const loader = async ({request}: LoaderFunctionArgs) => {
  const user = await getUserFromUPN(getUPNFromHeaders(request))

  if (!user || user.type !== 'STAFF') {
    throw new Response('Access Denied', {status: 403})
  }

  let files = await readdir(assetsDir)
  const url = new URL(request.url)

  const del = url.searchParams.get('delete')

  if (del !== null) {
    const file = files[parseInt(del)]

    await unlink(path.join(assetsDir, file))

    files = await readdir(assetsDir)
  }

  return json({user, files})
}

export const action = async ({request}: ActionFunctionArgs) => {
  const user = await getUserFromUPN(getUPNFromHeaders(request))

  if (!user || user.type !== 'STAFF') {
    throw new Response('Access Denied', {status: 403})
  }

  const uploadHandler = unstable_composeUploadHandlers(
    unstable_createFileUploadHandler({
      maxPartSize: 50_000_000,
      directory: 'public/assets/',
      file: ({filename}) => {
        return filename
      }
    }),
    unstable_createMemoryUploadHandler()
  )

  const formData = await unstable_parseMultipartFormData(request, uploadHandler)

  const fileData = formData.get('file') as any as {filepath: string} | undefined

  invariant(fileData)

  return redirect('/admin/assets')
}

const AdminAssets = () => {
  const {files} = useLoaderData<typeof loader>()

  return (
    <div className="pt-12">
      <div className="w-1/2 bg-white rounded-xl shadow-xl m-auto p-2 mb-4">
        <h1 className="text-2xl">Assets</h1>
        <table>
          <thead>
            <tr>
              <th>File</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {files.map((file, i) => {
              return (
                <tr key={i}>
                  <td>
                    <a href={`/assets/${file}`}>{file}</a>
                  </td>
                  <td>
                    <a href={`?delete=${i}`}>🗑</a>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <form
        className="w-1/2 bg-white rounded-xl shadow-xl m-auto p-2"
        method="POST"
        encType="multipart/form-data"
      >
        <h2 className="text-xl">Upload Asset</h2>
        <fieldset className={fieldsetClasses()}>
          <label className={labelClasses()}>
            <span className={labelSpanClasses()}>File</span>
            <input type="file" className={inputClasses()} name="file" />
            <span className={labelInfoClasses()}>
              Upload <i>any</i> file here. File name is preserved so be sure to
              not overwrite an exisiting asset unless you mean to.
            </span>
          </label>
          <div className={labelClasses()}>
            <button className={buttonClasses()}>Upload</button>
          </div>
        </fieldset>
      </form>
    </div>
  )
}

export default AdminAssets
