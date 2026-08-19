(() => {
  const languages = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Rust', 'Go',
    'HTML', 'CSS', 'PHP', 'Ruby', 'Kotlin', 'Swift', 'Bash', 'SQL', 'Lua',
    'Dart', 'R', 'Scala', 'Perl', 'Haskell', 'Assembly'
  ]

  const reopenSearch = () => {
    const input = document.querySelector('.hero-search input')
    if (!input) return
    input.focus()
  }

  const setSearchValue = (value) => {
    const input = document.querySelector('.hero-search input')
    if (!input) return
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
    setter?.call(input, value)
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.focus()
  }

  const addLanguagePicker = (dropdown) => {
    if (dropdown.querySelector('.search-languages')) return

    const section = document.createElement('div')
    section.className = 'search-section search-languages'
    section.innerHTML = `
      <div class="search-section-title"><span>Languages</span></div>
      <div class="search-items search-language-items"></div>
    `

    const items = section.querySelector('.search-language-items')
    languages.forEach((language) => {
      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'search-suggestion'
      button.textContent = language
      button.addEventListener('click', () => {
        setSearchValue(language)
        setTimeout(reopenSearch, 0)
      })
      items.appendChild(button)
    })

    const popular = [...dropdown.querySelectorAll('.search-section')].find((section) =>
      section.textContent?.includes('Popular searches')
    )
    dropdown.insertBefore(section, popular || dropdown.lastElementChild)
  }

  const observer = new MutationObserver(() => {
    const dropdown = document.querySelector('.search-dropdown')
    if (dropdown) addLanguagePicker(dropdown)
  })

  observer.observe(document.body, { childList: true, subtree: true })

  document.addEventListener('click', (event) => {
    const target = event.target
    if (!(target instanceof Element)) return
    if (!target.closest('.search-dropdown')) return
    if (target.closest('.search-close')) return

    const interactive = target.closest('.search-filter, .search-suggestion, .search-chip, .search-clear')
    if (!interactive) return

    // The React handlers may close the dropdown for actions that change search state.
    // Re-focus the search box after React finishes rendering so the dropdown stays open.
    setTimeout(() => {
      if (document.querySelector('.search-dropdown')) return
      reopenSearch()
    }, 0)
  }, false)
})()
