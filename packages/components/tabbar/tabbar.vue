<template>
    <div v-on="listeners" :class="['mvi-tabbar',border?'mvi-tabbar-border':'',fixed?'mvi-tabbar-fixed':'']" :style="tabbarStyle">
        <m-tabbar-item v-for="(item,index) in tabs" :key="'tab-'+index" :name="item.name" :value="item.value" :icon="item.icon" :disabled="item.disabled" :route="item.route" :style="tabbarItemStyle(index)">
        </m-tabbar-item>
    </div>
</template>

<script>
import mTabItem from './tabbar-item'

export default {
    name: 'm-tabbar',
    components: {
        'm-tabbar-item': mTabItem
    },
    provide() {
        return {
            tabbar: this
        }
    },
    model: {
        prop: 'value',
        event: 'model-change'
    },
    props: {
        //激活标签的value值
        value: {
            type: [Object, Number, String, Array],
            default: null
        },
        //配置
        tabs: {
            type: Array,
            default: function () {
                return []
            }
        },
        //是否固定底部
        fixed: {
            type: Boolean,
            default: false
        },
        //是否显示上边框
        border: {
            type: Boolean,
            default: false
        },
        //层级
        zIndex: {
            type: Number,
            default: 400
        },
        //激活颜色
        activeColor: {
            type: String,
            default: null
        },
        //未激活颜色
        inactiveColor: {
            type: String,
            default: null
        },
        //是否显示点击态
        active: {
            type: Boolean,
            default: true
        },
        //标签排列方式
        flex: {
            type: String,
            default: null
        },
        //设置每个标签左外边距
        offset: {
            type: String,
            default: null
        }
    },
    computed: {
        listeners() {
            return Object.assign({}, this.$listeners)
        },
        tabbarItemStyle() {
            return index => {
                let style = {}
                if (index != 0 && this.offset) {
                    style.marginLeft = this.offset
                }
                return style
            }
        },
        tabbarStyle() {
            let style = {}
            if (this.fixed) {
                style.zIndex = this.zIndex
            }
            if (this.flex) {
                style.justifyContent = this.flex
            }
            return style
        }
    },
    methods: {
        //tab切换
        getActiveValue(value) {
            this.$emit('update:value', value)
            this.$emit('model-change', value)
        },
        //点击tab
        itemClick(props) {
            this.$emit('item-click', props)
        }
    }
}
</script>

<style scoped lang="less">
@import '../../css/mvi-basic.less';

.mvi-tabbar {
    display: flex;
    display: -webkit-flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: @mini-height*2;
    background-color: #fff;
    padding: 0 @mp-xs;
    color: @font-color-default;
}

.mvi-tabbar.mvi-tabbar-border {
    border-top: 1px solid @border-color;
}

.mvi-tabbar-fixed {
    position: fixed;
    bottom: 0;
    left: 0;
}
</style>
