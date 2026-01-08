// Component for getting the news articles relevant to the current selected symbol
function NewsArticles({ currentArticles }) {
  if (currentArticles.length === 0) {
    return <p className="text-center pt-5 text-stone-400">No articles available</p>
  }

  return (
    <div className="">
      <div className="flex justify-center">
        <h2 className="align-middle font-mono tracking-wider text-2xl text-neutral-400">CURRENT NEWS</h2>
      </div>
      <div className="flex justify-center pt-10 gap-15 border-t-1 border-stone-800">
        {currentArticles.map((article) => (
          <a
            key={article.id}
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group w-72 h-44 rounded-xl overflow-hidden
                      border border-white/10 bg-white/5 backdrop-blur-sm
                      transition-all duration-200
                      hover:border-green-400/40 hover:-translate-y-1"
          >
            <img
              src={article.image_url}
              alt={article.title}
              className="absolute inset-0 w-full h-full object-cover
                        grayscale-[30%] brightness-75
                        transition-all duration-200
                        group-hover:grayscale-0 group-hover:brightness-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-0 p-3">
              <p className="text-sm text-white/90 leading-snug line-clamp-2">
                {article.title}
              </p>
              <span className="text-xs text-white/50">
                News
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

export default NewsArticles