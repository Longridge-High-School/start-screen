import {format} from 'date-fns'

export const Intro = ({
  name,
  title,
  dateFormat,
  logo
}: {
  name?: string
  title: string
  dateFormat: string
  logo: string
}) => {
  return (
    <div className="col-span-1 text-center bg-white rounded shadow xl:col-span-2">
      <img src={logo} className="w-32 mx-auto pt-4" alt="Logo" />

      <h1
        className="text-brand-dark text-5xl leading-[4rem] font-bold [text-shadow:0_14px_18px_rgba(0,0,0,0.12)] mb-5"
        dangerouslySetInnerHTML={{__html: title}}
      />
      {name ? (
        <h2 className="text-brand-dark text-xl font-bold mb-3">{name}</h2>
      ) : (
        ''
      )}
      <form
        action="https://www.google.com/search"
        method="GET"
        className="grid grid-cols-6 gap-2 p-2"
      >
        <img
          src="/img/google.jpg"
          className="h-16 col-span-2 xl:col-span-1"
          alt="Google Logo"
        />
        <input
          type="search"
          className="border border-black rounded w-full col-span-4 md:col-span-3 xl:col-span-4 my-2 p-2"
          name="q"
        />
        <button
          type="submit"
          className="bg-gray-200 rounded m-2 border-2 border-gray-200 hover:border-gray-400 col-span-6 md:col-span-1"
        >
          Google Search
        </button>
      </form>
      <h3 className="text-lg text-brand-light font-bold mb-2">
        {format(new Date(), dateFormat)}
      </h3>
    </div>
  )
}
