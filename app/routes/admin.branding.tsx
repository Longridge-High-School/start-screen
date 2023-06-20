import {
  type LoaderArgs,
  type ActionArgs,
  json,
  redirect,
  unstable_parseMultipartFormData,
  unstable_composeUploadHandlers,
  unstable_createFileUploadHandler,
  unstable_createMemoryUploadHandler
} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import path from 'path'
import {invariant} from '@arcath/utils'

import {getUPNFromHeaders, getUserFromUPN} from '~/lib/user.server'
import {getConfigValue, setConfigValue} from '~/lib/config.server'

import {compileMDX} from '~/lib/mdx.server'

import {
  buttonClasses,
  fieldsetClasses,
  inputClasses,
  labelClasses,
  labelInfoClasses,
  labelSpanClasses
} from '~/lib/classes'

export const loader = async ({request}: LoaderArgs) => {
  const user = await getUserFromUPN(getUPNFromHeaders(request))

  if (!user || !user.admin) {
    throw new Response('Access Denied', {status: 403})
  }

  const brandDark = await getConfigValue('brandDark')
  const brandLight = await getConfigValue('brandLight')
  const logo = await getConfigValue('logo')
  const background = await getConfigValue('background')
  const headerStrip = await getConfigValue('headerStrip')

  return json({user, brandDark, brandLight, logo, background, headerStrip})
}

export const action = async ({request}: ActionArgs) => {
  const user = await getUserFromUPN(getUPNFromHeaders(request))

  if (!user || !user.admin) {
    throw new Response('Access Denied', {status: 403})
  }

  const uploadHandler = unstable_composeUploadHandlers(
    unstable_createFileUploadHandler({
      maxPartSize: 5_000_000,
      directory: 'public/assets/',
      file: ({filename}) => {
        return `branding-${filename}`
      }
    }),
    unstable_createMemoryUploadHandler()
  )

  const formData = await unstable_parseMultipartFormData(request, uploadHandler)

  const brandLight = formData.get('brand-light') as string | undefined
  const brandDark = formData.get('brand-dark') as string | undefined
  const headerStrip = formData.get('header-strip') as string | undefined

  const logoData = formData.get('logo') as any as {filepath: string} | undefined
  const bgData = formData.get('background') as any as
    | {filepath: string}
    | undefined

  invariant(brandLight)
  invariant(brandDark)
  invariant(headerStrip)

  await setConfigValue('brandLight', brandLight)
  await setConfigValue('brandDark', brandDark)
  await setConfigValue('headerStrip', headerStrip)
  await setConfigValue('headerStripCache', await compileMDX(headerStrip))

  if (logoData && logoData.filepath) {
    await setConfigValue('logo', `/assets/${path.basename(logoData.filepath)}`)
  }

  if (bgData && bgData.filepath) {
    await setConfigValue(
      'background',
      `/assets/${path.basename(bgData.filepath)}`
    )
  }

  return redirect('/admin/branding')
}

const AdminBranding = () => {
  const {brandLight, brandDark, logo, background, headerStrip} =
    useLoaderData<typeof loader>()

  return (
    <div className="bg-white rounded-xl shadow-xl mt-4 m-auto w-3/4 p-2">
      <h1 className="text-3xl mb-4">Branding</h1>
      <form method="POST" encType="multipart/form-data">
        <div className="grid grid-cols-2 gap-2">
          <fieldset className={fieldsetClasses()}>
            <label className={labelClasses()}>
              <span className={labelSpanClasses()}>Brand Dark</span>
              <input
                type="color"
                name="brand-dark"
                className={inputClasses('p-0')}
                defaultValue={brandDark}
              />
            </label>
            <label className={labelClasses()}>
              <span className={labelSpanClasses()}>Brand Light</span>
              <input
                type="color"
                name="brand-light"
                className={inputClasses('p-0')}
                defaultValue={brandLight}
              />
            </label>
            <label className={labelClasses()}>
              <span className={labelSpanClasses()}>Header Strip</span>
              <textarea
                name="header-strip"
                className={inputClasses()}
                defaultValue={headerStrip}
              />
              <span className={labelInfoClasses()}>
                MDX Used for the header strip
              </span>
            </label>
          </fieldset>
          <fieldset className={fieldsetClasses()}>
            <label className={labelClasses()}>
              <span className={labelSpanClasses()}>Logo</span>
              <input type="file" name="logo" className={inputClasses()} />
              <span className={labelInfoClasses()}>
                Only choose a file if you want to change the logo. Will be
                uploaded as an asset called <i>brading-(your-file-name)</i>
              </span>
            </label>
            <img src={logo} alt="Logo" className="m-auto w-64" />
            <label className={labelClasses()}>
              <span className={labelSpanClasses()}>Background</span>
              <input type="file" name="background" className={inputClasses()} />
            </label>
            <img src={background} alt="Background" className="m-auto w-64" />
          </fieldset>
        </div>
        <button className={buttonClasses()}>Save</button>
      </form>
    </div>
  )
}

export default AdminBranding
