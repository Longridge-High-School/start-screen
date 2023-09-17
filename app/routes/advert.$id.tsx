import {type LoaderFunctionArgs, json} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'

import {getPrisma} from '~/lib/prisma'

export const loader = async ({params}: LoaderFunctionArgs) => {
  const prisma = getPrisma()

  const advert = await prisma.advert.findFirstOrThrow({
    where: {id: parseInt(params.id!)}
  })

  return json({advert})
}

const AdvertPage = () => {
  const {advert} = useLoaderData<typeof loader>()

  return (
    <div className="text-center p-8 w-full">
      <img
        src={`/adverts/${advert.image}`}
        alt={advert.name}
        className="aspect-video max-w-full m-auto mb-8 rounded-xl shadow-xl"
      />
      <a href="/start" className="bg-gray-300 rounded shadow p-2">
        Back
      </a>
    </div>
  )
}

export default AdvertPage
