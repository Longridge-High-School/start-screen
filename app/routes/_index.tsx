import {redirect, type LoaderFunction} from '@remix-run/node'

import {getConfigValue} from '~/lib/config.server'

export const loader: LoaderFunction = async () => {
  const target = await getConfigValue('indexPage')

  return redirect(target)
}
