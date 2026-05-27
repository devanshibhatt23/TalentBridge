export function SearchBar({
  keyword,
  onKeywordChange,
  onSubmit,
  placeholder = 'Search…',
  children,
}) {
  return (
    <form
      className="searchbar"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit?.()
      }}
    >
      <input
        className="input"
        type="search"
        value={keyword}
        onChange={(e) => onKeywordChange(e.target.value)}
        placeholder={placeholder}
      />
      {children}
      <button className="btn btn--primary" type="submit">
        Search
      </button>
    </form>
  )
}
