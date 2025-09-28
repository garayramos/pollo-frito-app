const ThermalPrinter = require("node-thermal-printer").printer;
const PrinterTypes = require("node-thermal-printer").types;

// Obtener impresoras disponibles
const listarImpresoras = async (req, res) => {
  try {
    // node-thermal-printer no lista automáticamente impresoras,
    // usamos el paquete printer de node para esto
    const printerList = require('printer').getPrinters();
    res.json(printerList.map(p => ({ name: p.name, status: p.status })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'No se pudieron listar impresoras' });
  }
};

// Imprimir ticket
const imprimirTicket = async (req, res) => {
  const { venta, impresoraNombre } = req.body;

  let printer = new ThermalPrinter({
    type: PrinterTypes.EPSON,  // cambiar según impresora del cliente
    interface: `printer:${impresoraNombre}`,
  });

  printer.alignCenter();
  printer.println("Broaster Rey del Pollo Frito");
  printer.println(`Venta No: ${venta.venta_id}`);
  printer.println(`Fecha: ${new Date().toLocaleString()}`);
  printer.drawLine();

  venta.productos.forEach(p => {
    printer.tableCustom([
      { text: p.nombre || "Producto", align: "LEFT", width: 0.5 },
      { text: p.cantidad.toString(), align: "CENTER", width: 0.2 },
      { text: `Q${(p.precio_unitario * p.cantidad).toFixed(2)}`, align: "RIGHT", width: 0.3 }
    ]);
  });

  printer.drawLine();
  printer.println(`TOTAL: Q${venta.total.toFixed(2)}`);
  printer.cut();

  try {
    await printer.execute();
    res.json({ mensaje: "Ticket impreso correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al imprimir", error: err });
  }
};

module.exports = { listarImpresoras, imprimirTicket };
