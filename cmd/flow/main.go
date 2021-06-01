package main

import (
	"sync"

	"github.com/d2r2/go-logger"
	"github.com/rpoisel/iot/cmd/flow/components/comm"
	"github.com/rpoisel/iot/cmd/flow/components/homeautomation"
	"github.com/rpoisel/iot/cmd/flow/components/io"
	"github.com/rpoisel/iot/cmd/flow/components/logic"
	"github.com/rpoisel/iot/cmd/flow/graph"
)

func newHomeautomationApp() *graph.Graph {
	n := graph.NewGraph()

	m := &sync.Mutex{}

	n.AddOrPanic("pcf8574in", io.NewPCF8574In(1, 0x38, m))
	n.AddOrPanic("pcf8574out", io.NewPCF8574Out(1, 0x20, m))
	n.AddOrPanic("MQTTin", new(comm.MQTTReceive))
	n.AddOrPanic("cmp", logic.NewCompareString("true"))
	n.AddOrPanic("triggerStiegeLicht", new(logic.R_Trig))
	n.AddOrPanic("triggerKuecheLichtZeile", new(logic.R_Trig))
	n.AddOrPanic("lightStiege", new(homeautomation.Light))
	n.AddOrPanic("lightKuecheZeile", new(homeautomation.Light))
	n.AddOrPanic("split", new(logic.Split2Bool))
	n.AddOrPanic("nop", new(logic.NopBool))

	n.ConnectOrPanic("pcf8574in", "Pin0", "nop", "In")
	n.ConnectOrPanic("pcf8574in", "Pin1", "triggerStiegeLicht", "In")
	n.ConnectOrPanic("pcf8574in", "Pin2", "triggerKuecheLichtZeile", "In")
	n.ConnectOrPanic("pcf8574in", "Pin3", "nop", "In")
	n.ConnectOrPanic("pcf8574in", "Pin4", "nop", "In")
	n.ConnectOrPanic("pcf8574in", "Pin5", "nop", "In")
	n.ConnectOrPanic("pcf8574in", "Pin6", "nop", "In")
	n.ConnectOrPanic("pcf8574in", "Pin7", "nop", "In")
	n.ConnectOrPanic("triggerStiegeLicht", "Out", "lightStiege", "In")
	n.ConnectOrPanic("lightStiege", "Out", "split", "In")
	n.ConnectOrPanic("split", "Out0", "pcf8574out", "Pin1")
	n.ConnectOrPanic("split", "Out1", "pcf8574out", "Pin2")
	n.ConnectOrPanic("triggerKuecheLichtZeile", "Out", "lightKuecheZeile", "In")
	n.ConnectOrPanic("MQTTin", "Out", "cmp", "In")
	n.ConnectOrPanic("cmp", "Out", "lightKuecheZeile", "In")
	n.ConnectOrPanic("lightKuecheZeile", "Out", "pcf8574out", "Pin3")

	return n
}

func main() {
	logger.ChangePackageLogLevel("i2c", logger.InfoLevel)

	net := newHomeautomationApp()

	wait := net.Run()

	<-wait
}
