import type {LoaderFunction} from '@remix-run/node'
import {redirect} from '@remix-run/node'

import {getConfigValue} from '~/lib/config.server'

export const loader: LoaderFunction = async ({context}) => {
  const target = await getConfigValue('indexPage')

  return redirect(target)
}
