import {type LoaderArgs, type ActionArgs, json, redirect} from '@remix-run/node'
import {Outlet, useLoaderData} from '@remix-run/react'
import {invariant} from '@arcath/utils'

import {getUPNFromHeaders, getUserFromUPN} from '~/lib/user.server'
import {getPrisma} from '~/lib/prisma'

import {
  fieldsetClasses,
  labelClasses,
  inputClasses,
  buttonClasses,
  labelSpanClasses
} from '~/lib/classes'

export const loader = async ({request}: LoaderArgs) => {
  const user = await getUserFromUPN(getUPNFromHeaders(request))

  if (!user || !user.admin) {
    throw new Response('Access Denied', {status: 403})
  }

  const prisma = getPrisma()

  const pages = await prisma.page.findMany({
    select: {
      id: true,
      title: true,
      simplePage: true,
      slug: true,
      staffOnly: true
    },
    orderBy: {title: 'asc'}
  })

  return json({pages, user})
}

export const action = async ({request}: ActionArgs) => {
  const user = await getUserFromUPN(getUPNFromHeaders(request))

  if (!user || user.type !== 'STAFF') {
    throw new Response('Access Denied', {status: 403})
  }

  const prisma = getPrisma()

  const formData = await request.formData()

  const title = formData.get('title') as string | undefined
  const slug = formData.get('slug') as string | undefined
  const simple = formData.get('simple') as string | undefined
  const staff = formData.get('staff') as string | undefined

  invariant(title)
  invariant(slug)

  await prisma.page.create({
    data: {
      title,
      slug,
      simplePage: simple !== null,
      staffOnly: staff !== null,
      body: '',
      bodyCache: ''
    }
  })

  return redirect('/admin/pages')
}

const AdminPages = () => {
  const {pages} = useLoaderData<typeof loader>()

  return (
    <div className="grid grid-cols-2">
      <div className="bg-white shadow rounded-xl m-4 p-2">
        <h1 className="text-3xl mb-2">Pages</h1>
        <table>
          <thead>
            <tr>
              <th scope="col" className="px-6 py-3">
                Title
              </th>
              <th scope="col" className="px-6 py-3">
                Slug
              </th>
              <th scope="col" className="px-6 py-3">
                Simple?
              </th>
              <th scope="col" className="px-6 py-3">
                Staff Only?
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {pages.map(({id, title, simplePage, slug, staffOnly}) => {
              return (
                <tr key={id}>
                  <td>{title}</td>
                  <td>
                    <a href={`/p/${slug}`}>{slug}</a>
                  </td>
                  <td>{simplePage ? 'Yes' : 'No'}</td>
                  <td>{staffOnly ? 'Yes' : 'No'}</td>
                  <td>
                    <a href={`/admin/pages/edit/${id}`}>✏</a>
                    <br />
                    <a href={`/admin/pages/delete/${id}`}>🗑</a>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <form method="post">
          <fieldset className={fieldsetClasses()}>
            <label className={labelClasses()}>
              <span className={labelSpanClasses()}>Title</span>
              <input name="title" type="text" className={inputClasses()} />
            </label>
            <label className={labelClasses()}>
              <span className={labelSpanClasses()}>Slug</span>
              <input name="slug" type="text" className={inputClasses()} />
            </label>
            <label className={labelClasses()}>
              <span className={labelSpanClasses()}>Simple Page?</span>
              <input type="checkbox" name="simple" className={inputClasses()} />
            </label>
            <label className={labelClasses()}>
              <span className={labelSpanClasses()}>Staff Only?</span>
              <input type="checkbox" name="staff" className={inputClasses()} />
            </label>
            <div className={labelClasses()}>
              <button className={buttonClasses()}>Add Page</button>
            </div>
          </fieldset>
        </form>
      </div>
      <Outlet />
    </div>
  )
}

export default AdminPages
