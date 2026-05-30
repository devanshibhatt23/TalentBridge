export function SearchBar({
  keyword,
  onKeywordChange,
  placeholder = 'Search…',
  children,
}) {
  return (
    <div className="searchbar">
      <input
        className="input"
        type="search"
        value={keyword}
        onChange={(e) => onKeywordChange(e.target.value)}
        placeholder={placeholder}
      />
      {children}
    </div>
  )
}
