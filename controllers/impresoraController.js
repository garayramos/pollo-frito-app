// controllers/impresoraController.js
const ThermalPrinter = require('node-thermal-printer').printer;
const PrinterTypes = require('node-thermal-printer').types;

// Listar impresoras disponibles
const listarImpresoras = async (req, res) => {
  try {
    const impresoras = await ThermalPrinter.getPrinters();
    res.json(impresoras); // ["EPSON TM-T20", "Microsoft Print to PDF", ...]
  } catch (err) {
    console.error("Error al listar impresoras:", err);
    res.status(500).json({ mensaje: "No se pudieron listar las impresoras" });
  }
};

// Guardar impresora seleccionada (opcional)
const seleccionarImpresora = (req, res) => {
  const { nombre } = req.body;
  if (!nombre) return res.status(400).json({ mensaje: "Debes enviar el nombre de la impresora" });

  // Aquí podrías guardar en BD o archivo de configuración
  res.json({ mensaje: `Impresora "${nombre}" seleccionada correctamente` });
};

// Imprimir texto
const imprimirTexto = async (req, res) => {
  const { nombre, texto } = req.body;
  if (!nombre || !texto) return res.status(400).json({ mensaje: "Debes enviar nombre y texto" });

  const printer = new ThermalPrinter({
    type: PrinterTypes.EPSON,
    interface: `printer:${nombre}`
  });

  printer.println(texto);
  printer.cut();

  try {
    await printer.execute();
    res.json({ mensaje: "Impresión enviada correctamente" });
  } catch (err) {
    console.error("Error imprimiendo:", err);
    res.status(500).json({ mensaje: "Error al enviar impresión" });
  }
};

module.exports = {
  listarImpresoras,
  seleccionarImpresora,
  imprimirTexto
};
