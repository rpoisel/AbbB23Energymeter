import 'regenerator-runtime/runtime.js' // required by Rete
import Rete from 'rete'

export const VueNumControl = {
    props: ['readonly', 'emitter', 'ikey', 'getData', 'putData'],
    template: '<input type="number" :readonly="readonly" :value="value" @input="change($event)" @dblclick.stop="" @pointerdown.stop="" @pointermove.stop=""/>',
    data() {
        return {
            value: 0
        }
    },
    methods: {
        change(e) {
            this.value = +e.target.value
            this.update()
        },
        update() {
            if (this.ikey)
                this.putData(this.ikey, this.value)
            this.emitter.trigger('process')
        }
    },
    mounted() {
        this.value = this.getData(this.ikey)
    }
}

export class NumControl extends Rete.Control {
    constructor(emitter, key, readonly) {
        super(key)
        this.component = VueNumControl
        this.props = { emitter, ikey: key, readonly }
    }

    setValue(val) {
        this.vueContext.value = val
    }
}