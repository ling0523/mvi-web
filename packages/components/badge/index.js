import badge from "./badge"

badge.install = function(Vue){
	Vue.component(badge.name,badge)
}

export default badge