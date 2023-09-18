import {
  type ActionFunctionArgs,
  redirect,
  unstable_parseMultipartFormData,
  unstable_composeUploadHandlers,
  unstable_createFileUploadHandler,
  unstable_createMemoryUploadHandler
} from '@remix-run/node'
import {invariant} from '@arcath/utils'

import {getUPNFromHeaders, getUserFromUPN} from '~/lib/user.server'

import {addJob} from '~/lib/queues.server'

export const action = async ({request}: ActionFunctionArgs) => {
  const user = await getUserFromUPN(getUPNFromHeaders(request))

  if (!user || !user.admin) {
    throw new Response('Access Denied', {status: 403})
  }

  const uploadHandler = unstable_composeUploadHandlers(
    unstable_createFileUploadHandler({
      maxPartSize: 20_000_000,
      directory: 'public/backups/',
      file: ({filename}) => {
        return filename
      }
    }),
    unstable_createMemoryUploadHandler()
  )

  const formData = await unstable_parseMultipartFormData(request, uploadHandler)

  const fileData = formData.get('file') as any as {filepath: string} | undefined

  invariant(fileData)

  await addJob('restoreBackup', {filePath: fileData.filepath})

  return redirect('/admin')
}
