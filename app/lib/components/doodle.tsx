import {type Doodle as DBDoodle} from '@prisma/client'

import {MDXComponent} from '../mdx'

export const Doodle = ({
  doodle,
  currentUser
}: {
  doodle: Pick<DBDoodle, 'bodyCache'> | null
  currentUser: string
}) => {
  return (
    <div>
      {doodle ? (
        <MDXComponent code={doodle.bodyCache} currentUser={currentUser} />
      ) : (
        ''
      )}
    </div>
  )
}
