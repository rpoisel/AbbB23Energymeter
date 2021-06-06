import Rete, { Node } from 'rete'
import { NodeData, WorkerInputs, WorkerOutputs } from 'rete/types/core/data';
import {NumControl, VueNumControl} from './tmp';

const NumSocket = new Rete.Socket('Number value');

export { NumSocket };

// var VueNumControl = {
//     props: ['readonly', 'emitter', 'ikey', 'getData', 'putData'],
//     template: '<input type="number" :readonly="readonly" :value="value" @input="change($event)" @dblclick.stop="" @pointerdown.stop="" @pointermove.stop=""/>',

//     data() {
//         return {
//             value: 0
//         }
//     },
//     methods: {
//         change(e: { target: { value: string | number; }; }) {
//             this.value = +e.target.value
//             this.update()
//         },
//         update() {
//             if (this.ikey) this.putData(this.ikey, this.value)
//             this.emitter.trigger('process')
//         }
//     },
//     mounted() {
//         this.value = this.getData(this.ikey)
//     }
// }


// export class NumControl extends Rete.Control {
//     component: { props: string[]; template: string; data(): { value: number; }; methods: { change(e: { target: { value: string | number; }; }): void; update(): void; }; mounted(): void; };
//     props: { emitter: any; ikey: string; readonly: any; };
//     vueContext: any;
//     constructor(emitter: any, key: string, readonly: any) {
//         super(key)
//         this.component = VueNumControl
//         this.props = { emitter, ikey: key, readonly }
//     }

//     setValue(val: any) {
//         this.vueContext.value = val
//     }
// }

export class SubComponent extends Rete.Component {
    constructor() {
        super('Sub')
    }

    builder(node: Node): Promise<void> {
        var inp1 = new Rete.Input('num', 'Number', NumSocket)
        var inp2 = new Rete.Input('num2', 'Number2', NumSocket)
        var out = new Rete.Output('num', 'Number', NumSocket)

        inp1.addControl(new NumControl(this.editor, 'num', false))
        inp2.addControl(new NumControl(this.editor, 'num2', false))

        node
        .addInput(inp1)
        .addInput(inp2)
        .addControl(new NumControl(this.editor, 'preview', true))
        .addOutput(out)

        return new Promise<void>((resolve, reject) => {
            resolve();
        })

    }
    worker(node: NodeData, inputs: WorkerInputs, outputs: WorkerOutputs, ...args: unknown[]): void {
        // var n1 = inputs['num'].length ? inputs['num'][0] : node.data.num1
        // var n2 = inputs['num2'].length ? inputs['num2'][0] : node.data.num2
        // var diff = n1 - n2

        // this.editor.nodes
        //     .find(n => n.id == node.id)
        //     .controls.get('preview')
        //     .setValue(diff)
        // outputs['num'] = diff
    }
}