const how = document.getElementById('how')
const modal_container = document.getElementById('modal_container')
const modal_container_two = document.getElementById('modal_container_two')
const howto = document.getElementById('htp')
const sta = document.getElementById('sta')
const who = document.getElementById('who')
const sil_container = document.getElementById('sil_container')
const topbar = document.getElementById('topbar')
const close = document.getElementById('close')
const closetwo = document.getElementById('closetwo')
const closethree = document.getElementById('closethree')
const stats = document.getElementById('stats')
const showsil = document.getElementById('showsil')
const searchCli = document.getElementById('inputs')
const share = document.getElementById('share')
how.addEventListener('click', () => {
  modal_container.classList.add('shows')

})

close.addEventListener('click', () => {
  modal_container.classList.remove('shows')
  modal_container.setAttribute('closing', "")
})

stats.addEventListener('click', () => {
  modal_container_two.classList.add('show')


})

closetwo.addEventListener('click', () => {
  modal_container_two.classList.remove('show')
  modal_container_two.setAttribute('closing', "")

})

showsil.addEventListener('click', () => {
  sil_container.classList.add('shows')
})

closethree.addEventListener('click', () => {
  sil_container.classList.remove('shows')
  sil_container.setAttribute('closing', "")

})
searchCli.addEventListener('click', () => {
  inputs.classList.add('shows')


})

close.addEventListener('click', () => {
  modal_container.classList.remove('shows')
  modal_container.setAttribute('closing', "")
})



document.addEventListener('click', e => {
  if (!howto.contains(e.target) && e.target !== how) {
    if (modal_container.classList.contains("shows")) {
      modal_container.classList.remove('shows')
      modal_container.setAttribute('closing', "")

    }
  }
  if (!sta.contains(e.target) && e.target !== stats) {
    if (modal_container_two.classList.contains("show")) {
      modal_container_two.classList.remove('show')
      modal_container_two.setAttribute('closing', "")

    }
  }
//   if (!who.contains(e.target) && e.target !== showsil) {
//     if (sil_container.classList.contains("shows") && solved == false) {
//       sil_container.classList.remove('shows')
//       sil_container.setAttribute('closing', "")
//     }
//   }
// })

