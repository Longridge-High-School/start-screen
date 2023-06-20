import {
  type LoaderArgs,
  type ActionArgs,
  json,
  redirect,
  type LinksFunction
} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {invariant} from '@arcath/utils'
import CodeEditor from '@uiw/react-textarea-code-editor'
import {useState} from 'react'

import {getUPNFromHeaders, getUserFromUPN} from '~/lib/user.server'
import {getPrisma} from '~/lib/prisma'

import {compileMDX} from '~/lib/mdx.server'

import {
  fieldsetClasses,
  labelClasses,
  inputClasses,
  buttonClasses
} from '~/lib/classes'
import {log} from '~/log.server'

import styles from '@uiw/react-textarea-code-editor/dist.css'

export const links: LinksFunction = () => {
  return [{rel: 'stylesheet', href: styles}]
}

export const loader = async ({request, params}: LoaderArgs) => {
  const user = await getUserFromUPN(getUPNFromHeaders(request))

  if (!user || !user.admin) {
    throw new Response('Access Denied', {status: 403})
  }

  const prisma = getPrisma()

  const page = await prisma.page.findFirstOrThrow({
    where: {id: parseInt(params.id!)}
  })

  return json({page, user})
}

export const action = async ({request, params}: ActionArgs) => {
  const user = await getUserFromUPN(getUPNFromHeaders(request))

  if (!user || user.type !== 'STAFF') {
    throw new Response('Access Denied', {status: 403})
  }

  const prisma = getPrisma()

  const formData = await request.formData()

  const title = formData.get('title') as string | undefined
  const slug = formData.get('slug') as string | undefined
  const simple = formData.get('simple') as string | undefined
  const body = formData.get('body') as string | undefined
  const staff = formData.get('staff') as string | undefined

  invariant(title)
  invariant(slug)
  invariant(body)

  const bodyCache = await compileMDX(body)

  await prisma.page.update({
    where: {id: parseInt(params.id!)},
    data: {
      title,
      slug,
      simplePage: simple !== null,
      staffOnly: staff !== null,
      body,
      bodyCache
    }
  })
  await log('Pages', `Updated page ${title}`, user.username)

  return redirect('/admin/pages')
}

const AdminPagesEdit = () => {
  const {page} = useLoaderData<typeof loader>()
  const [body, setBody] = useState(page.body)

  return (
    <div className="rounded-xl bg-white shadow m-4 p-2">
      <h2 className="text-2xl">Edit Page</h2>
      <form method="POST">
        <fieldset className={fieldsetClasses()}>
          <label className={labelClasses()}>
            Title
            <input
              name="title"
              type="text"
              className={inputClasses()}
              defaultValue={page.title}
            />
          </label>
          <label className={labelClasses()}>
            Slug
            <input
              name="slug"
              type="text"
              className={inputClasses()}
              defaultValue={page.slug}
            />
          </label>
          <label className={labelClasses()}>
            Simple Page?
            <input
              type="checkbox"
              name="simple"
              className={inputClasses()}
              defaultChecked={page.simplePage}
            />
          </label>
          <label className={labelClasses()}>
            Staff Only?
            <input
              type="checkbox"
              name="staff"
              className={inputClasses()}
              defaultChecked={page.staffOnly}
            />
          </label>
          <label className={labelClasses()} htmlFor="body">
            Body
            <CodeEditor
              className={inputClasses('min-h-[55vh]')}
              language="jsx"
              name="body"
              value={body}
              onChange={e => {
                setBody(e.target.value)
              }}
            />
          </label>
          <div className={labelClasses()}>
            <button className={buttonClasses()}>Update Page</button>
          </div>
        </fieldset>
      </form>
    </div>
  )
}

export default AdminPagesEdit
