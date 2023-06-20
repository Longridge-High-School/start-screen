import type {ActionFunction, LoaderFunction} from '@remix-run/node'
import {json, redirect} from '@remix-run/server-runtime'
import {useLoaderData} from '@remix-run/react'
import {invariant, keys, asyncMap, asyncForEach} from '@arcath/utils'

import {getUPNFromHeaders, getUserFromUPN} from '~/lib/user.server'
import {
  labelClasses,
  inputClasses,
  fieldsetClasses,
  labelSpanClasses,
  buttonClasses
} from '~/lib/classes'

import {
  ConfigurableValues,
  getConfigValue,
  setConfigValue
} from '~/lib/config.server'
import {log} from '~/log.server'

export const loader: LoaderFunction = async ({request}) => {
  const user = await getUserFromUPN(getUPNFromHeaders(request))

  if (!user || !user.admin) {
    throw new Response('Access Denied', {status: 403})
  }

  const config = await asyncMap(keys(ConfigurableValues), async key => {
    return {
      key,
      value: await getConfigValue(key),
      description: ConfigurableValues[key].description
    }
  })

  return json({config})
}

export const action: ActionFunction = async ({request}) => {
  const user = await getUserFromUPN(getUPNFromHeaders(request))

  if (!user || !user.admin) {
    throw new Response('Access Denied', {status: 403})
  }

  const formData = await request.formData()

  asyncForEach(keys(ConfigurableValues), async key => {
    const value = formData.get(key) as string | undefined

    invariant(value)

    const currentValue = await getConfigValue(key)

    if (value !== currentValue) {
      await setConfigValue(key, value)
    }
  })

  await log('Config', 'Updated Config', user.username)

  return redirect('/admin')
}

const ConfigPage = () => {
  const {config} = useLoaderData() as {
    config: {key: string; value: string; description: string; type?: string}[]
  }

  return (
    <div className="bg-white w-1/2 rounded-xl shadow p-2 m-auto mt-4">
      <h1 className="text-3xl mb-4">Config</h1>
      <form method="POST">
        <fieldset className={fieldsetClasses()}>
          {config.map(({key, value, description, type}) => {
            if (type) {
              return <input type="hidden" value={value} key={key} name={key} />
            }

            return (
              <label
                className={labelClasses('border-b border-gray-100')} //"w-full grid grid-cols-3 border-gray-100 border-b mb-1"
                key={key}
              >
                <span className={labelSpanClasses()}>{key}</span>
                <input
                  name={key}
                  type="text"
                  className={inputClasses()}
                  defaultValue={value}
                />
                <p className="col-start-2 col-span-2">{description}</p>
              </label>
            )
          })}
          <div className={labelClasses('my-2')}>
            <button className={buttonClasses()}>Update Config</button>
          </div>
        </fieldset>
      </form>
    </div>
  )
}

export default ConfigPage
