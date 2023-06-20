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
    <div className="col-span-1 col-start-2 row-span-2 lg:col-span-1 2xl:row-span-2 2xl:col-start-5">
      {doodle ? (
        <MDXComponent code={doodle.bodyCache} currentUser={currentUser} />
      ) : (
        ''
      )}
    </div>
  )
}
