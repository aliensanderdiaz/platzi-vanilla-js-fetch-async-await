// console.log('hola mundo!');
// const noCambia = "Leonidas";

// let cambia = "@LeonidasEsteban"

// function cambiarNombre(nuevoNombre) {
//   cambia = nuevoNombre
// }


// $.ajax({
//   url: 'https://randomuser.me/api/',
//   dataType: 'json',
//   success: function(data) {
//     console.log(data);
//   }
// });

// $.ajax('https://randomuser.me/api/', {
//   method: 'GET',
//   success: function(data) {
//     console.log({ tipo: 'JQUERY', data});
//   },
//   error: function(error) {
//     console.log({ tipo: 'JQUERY', error});
//   }
// });

// fetch('https://randomuser.me/api/fdsfdfsdfsd')
//   .then(function(data) {
//     // console.log({ tipo: 'FETCH', data});
//     return data.json()
//   })
//   .then(function(data) {
//     console.log({ tipo: 'FETCH', data});
//     console.log({ user: data.results[0].name.first});
//   })
//   .catch(function(error) {
//     console.log({ tipo: 'FETCH', error});
//   })

(async function load() {

  const BASE_API = 'https://yts.mx/api/v2/'

  async function getData(url) {
    const respuesta = await fetch(url)
    const data = await respuesta.json()
    if (data.data.movie_count > 0) {
      return data
    }
    throw new Error('No se encontró ningun resultado')
  }

  const $form = document.getElementById('form')
  const $home = document.getElementById('home')
  const $featuringContainer = document.getElementById('featuring')

  function setAttributes($element, attributes) {
    for (const attribute in attributes) {
      $element.setAttribute(attribute, attributes[attribute])
    }
  }

  function featuringTemplate(movie) {
    return (
      `
        <div class="featuring">
          <div class="featuring-image">
            <img src="${movie.medium_cover_image}" width="70" height="100" alt="">
          </div>
          <div class="featuring-content">
            <p class="featuring-title">Pelicula encontrada</p>
            <p class="featuring-album">${movie.title}</p>
          </div>
        </div>
        `
    )
  }

  $form.addEventListener('submit', async (event) => {
    event.preventDefault();
    $home.classList.add('search-active')
    const $loader = document.createElement('img')
    setAttributes($loader, {
      src: 'src/images/loader.gif',
      height: 50,
      width: 50
    })
    $featuringContainer.append($loader)

    const data = new FormData($form)
    try {
      
      const {
        data: {
          movies: pelis
        }
      } = await getData(`${BASE_API}list_movies.json?limit=1&query_term=${data.get('name')}`)
  
      // const HTMLString = featuringTemplate(peli.data.movies[0])
      const HTMLString = featuringTemplate(pelis[0])
  
      $featuringContainer.innerHTML = HTMLString
    } catch (error) {
      alert(error.message)
      $loader.remove()
      $home.classList.remove('search-active')
    }
  })



  function videoItemTemplate(movie, categoria) {

    return (`
        <div class="primaryPlaylistItem" data-id="${movie.id}" data-categoria="${categoria}">
          <div class="primaryPlaylistItem-image">
            <img src="${movie.medium_cover_image}">
          </div>
          <h4 class="primaryPlaylistItem-title">
            ${movie.title}
          </h4>
        </div>
        `
    )

  }

  function createTemplate(HTMLString) {
    const html = document.implementation.createHTMLDocument();
    html.body.innerHTML = HTMLString
    return html.body.children[0]
  }



  function addEventClick($element) {
    $element.addEventListener('click', function () {
      showModal($element)
    })
  }


  function renderMovieList(list, $container, categoria) {
    $container.children[0].remove()
    list.forEach(movie => {
      const HTMLString = videoItemTemplate(movie, categoria)
      const movieElement = createTemplate(HTMLString)
      $container.append(movieElement)
      const image = movieElement.querySelector('img')
      image.addEventListener('load', (event) => {
        event.srcElement.classList.add('fadeIn')
      })
      addEventClick(movieElement)
    })
  }

  async function cacheExist(category) {
    const listName = `${category}List`

    const cacheList = window.localStorage.getItem(listName)

    if (cacheList) {
      return JSON.parse(cacheList)
    }
    const { data: { movies: data } } = await getData(`${BASE_API}list_movies.json?genre=${category}`)
    window.localStorage.setItem(listName, JSON.stringify(data))
    return data;
  }

  const $actionContainer = document.querySelector('#action')
  const actionList = await cacheExist('action')
  renderMovieList(actionList, $actionContainer, 'action')

  const $dramaContainer = document.querySelector('#drama')
  const dramaList = await cacheExist('drama')
  renderMovieList(dramaList, $dramaContainer, 'drama')
  
  
  const $animationContainer = document.querySelector('#animation')
  const animationList = await cacheExist('animation')
  renderMovieList(animationList, $animationContainer, 'animation')





  const $modal = document.getElementById('modal')
  const $overlay = document.getElementById('overlay')
  const $hideModal = document.getElementById('hide-modal')

  const $modalTitle = $modal.querySelector('h1')
  const $modalImage = $modal.querySelector('img')
  const $modalDescription = $modal.querySelector('p')

  function findById(list, id) {
    return list.find(movie => movie.id === parseInt(id, 10))
  }

  function findMovie(id, category) {
    switch (category) {
      case 'action':
        return findById(actionList, id)
      case 'drama':
        return findById(dramaList, id)
      default:
        return findById(animationList, id)
    }
  }

  function showModal($element) {
    $overlay.classList.add('active')
    $modal.style.animation = 'modalIn .8s forwards'
    const id = $element.dataset.id
    const category = $element.dataset.categoria

    const data = findMovie(id, category)

    $modalTitle.textContent = data.title
    $modalImage.setAttribute('src', data.medium_cover_image)
    $modalDescription.textContent = data.description_full
  }

  function hideModal() {
    $overlay.classList.remove('active')
    $modal.style.animation = 'modalOut .8s forwards'
  }

  $hideModal.addEventListener('click', hideModal)

})()

