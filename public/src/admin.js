const target = new URL('/index.html', window.location.origin)
target.searchParams.set('section', '401')
target.searchParams.set('tracker', '1')
target.searchParams.set('admin', 'login')
target.hash = 'tracker'
window.location.replace(target.toString())
