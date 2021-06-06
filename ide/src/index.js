import 'regenerator-runtime/runtime.js' // required by Rete
import Rete from 'rete'
import ConnectionPlugin from 'rete-connection-plugin'
import VueRenderPlugin from 'rete-vue-render-plugin'
import ContextMenuPlugin from 'rete-context-menu-plugin'
import AreaPlugin from 'rete-area-plugin'
import CommentPlugin from 'rete-comment-plugin'
import HistoryPlugin from 'rete-history-plugin'
import ConnectionMasteryPlugin from 'rete-connection-mastery-plugin'

import './style.css'

import { NumSocket, SubComponent } from './sample'
import { NumControl } from './tmp'

class NumComponent extends Rete.Component {
    constructor() {
        super('Number')
    }

    builder(node) {
        var out1 = new Rete.Output('num', 'Number', NumSocket)

        return node.addControl(new NumControl(this.editor, 'num')).addOutput(out1)
    }

    worker(node, inputs, outputs) {
        outputs['num'] = node.data.num
    }
}

class AddComponent extends Rete.Component {
    constructor() {
        super('Add')
    }

    builder(node) {
        var inp1 = new Rete.Input('num', 'Number', NumSocket)
        var inp2 = new Rete.Input('num2', 'Number2', NumSocket)
        var out = new Rete.Output('num', 'Number', NumSocket)

        inp1.addControl(new NumControl(this.editor, 'num'))
        inp2.addControl(new NumControl(this.editor, 'num2'))

        return node
            .addInput(inp1)
            .addInput(inp2)
            .addControl(new NumControl(this.editor, 'preview', true))
            .addOutput(out)
    }

    worker(node, inputs, outputs) {
        var n1 = inputs['num'].length ? inputs['num'][0] : node.data.num1
        var n2 = inputs['num2'].length ? inputs['num2'][0] : node.data.num2
        var sum = n1 + n2

        this.editor.nodes
            .find(n => n.id == node.id)
            .controls.get('preview')
            .setValue(sum)
        outputs['num'] = sum
    }
}

var container = document.querySelector('#rete')
var components = [new NumComponent(), new AddComponent(), new SubComponent()]

global.editor = new Rete.NodeEditor('demo@0.1.0', container)
editor.use(ConnectionPlugin)
editor.use(VueRenderPlugin)
editor.use(ContextMenuPlugin)
editor.use(AreaPlugin)
editor.use(CommentPlugin)
editor.use(HistoryPlugin)
editor.use(ConnectionMasteryPlugin)

var engine = new Rete.Engine('demo@0.1.0')

components.map(c => {
    global.editor.register(c)
    engine.register(c)
});

(async() => {
    var n1 = await components[0].createNode({ num: 2 })
    var n2 = await components[0].createNode({ num: 0 })
    var add = await components[1].createNode()

    n1.position = [80, 200]
    n2.position = [80, 400]
    add.position = [500, 240]

    global.editor.addNode(n1)
    global.editor.addNode(n2)
    global.editor.addNode(add)

    global.editor.connect(n1.outputs.get('num'), add.inputs.get('num'))
    global.editor.connect(n2.outputs.get('num'), add.inputs.get('num2'))

    global.editor.on(
        'process nodecreated noderemoved connectioncreated connectionremoved',
        async() => {
            console.log('process')
            await engine.abort()
            await engine.process(editor.toJSON())
        }
    )

    global.editor.view.resize()
    AreaPlugin.zoomAt(global.editor)
    global.editor.trigger('process')
})()