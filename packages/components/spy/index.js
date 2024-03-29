import $dap from 'dap-util'
import Spy from './spy'

Spy.install = Vue => {
    //滚动侦听
    Vue.directive('spy', {
        inserted(el, binding) {
            let options = {}
            if ($dap.common.isObject(binding.value)) {
                Object.assign(options, binding.value)
            }
            let spy = new Spy(el, options)
            spy.init()
            //将对象记录在元素里
            $dap.data.set(el, 'directive:spy', spy)
        },
        unbind(el, binding) {
            //获取对象
            let spy = $dap.data.get(el, 'directive:spy')
            if (spy) {
                //移除容器队列监听的滚动事件
                spy._setOff()
            }
        }
    })
}

export default Spy
