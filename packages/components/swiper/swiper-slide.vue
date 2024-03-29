<template>
    <transition v-if="swiper.fade" name="mvi-swiper-slide" @before-enter="addTransition" @after-enter="removeTransition" @before-leave="addTransition" @after-leave="removeTransition">
        <div v-on="listeners" v-show="swiper.fadeActiveIndex == slideIndex" class="mvi-swiper-slide-fade" :style="slideStyle">
            <slot></slot>
        </div>
    </transition>
    <div v-else v-on="listeners" class="mvi-swiper-slide" :style="slideStyle">
        <slot></slot>
    </div>
</template>

<script>
import $dap from 'dap-util'
export default {
    name: 'm-swiper-slide',
    created() {
        this.swiper.children.push(this)
    },
    inject: ['swiper'],
    computed: {
        listeners() {
            return Object.assign({}, this.$listeners)
        },
        slideStyle() {
            let style = {}
            if (this.swiper.vertical) {
                style.width = '100%'
                style.height = this.swiper.fade
                    ? '100%'
                    : 'calc(100% * ' + 1 / this.swiper.children.length + ')'
            } else {
                //横向
                style.height = '100%'
                style.width = this.swiper.fade
                    ? '100%'
                    : 'calc(100% * ' + 1 / this.swiper.children.length + ')'
            }
            return style
        },
        //slide在swiper中的序列值
        slideIndex() {
            return this.swiper.children.findIndex(item => {
                return $dap.common.equal(item._uid, this._uid)
            })
        }
    },
    methods: {
        addTransition(el) {
            if (this.swiper.useOpacity) {
                el.style.transition = 'opacity ' + this.swiper.speed + 'ms'
                el.style.webkitTransition =
                    'opacity ' + this.swiper.speed + 'ms'
            } else {
                el.style.transition = ''
                el.style.webkitTransition = ''
            }
        },
        removeTransition(el) {
            if (this.swiper.useOpacity) {
                el.style.transition = ''
                el.style.webkitTransition = ''
            } else {
                this.swiper.useOpacity = true
            }
        }
    }
}
</script>

<style scoped lang="less">
@import '../../css/mvi-basic.less';

.mvi-swiper-slide {
    display: block;
    flex: 1;
}

.mvi-swiper-slide-fade {
    display: block;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
}

.mvi-swiper-slide-enter,
.mvi-swiper-slide-leave-to {
    opacity: 0;
}
</style>
