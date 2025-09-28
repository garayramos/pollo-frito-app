// controllers/impresoraController.js
const ThermalPrinter = require('node-thermal-printer').printer;
const PrinterTypes = require('node-thermal-printer').types;
const os = require('os');

// Listar impresoras disponibles
const listarImpresoras = async (req, res) => {
  try {
    let impresoras = [];

    // Windows
    if (process.platform === 'win32') {
      const execSync = require('child_process').execSync;
      const output = execSync('wmic printer get name').toString();
      impresoras = output.split('\r\r\n').map(line => line.trim()).filter(line => line && line !== 'Name');
    }

    // Linux / Mac
    if (process.platform === 'linux' || process.platform === 'darwin') {
      const execSync = require('child_process').execSync;
      const output = execSync('lpstat -a').toString();
      impresoras = output.split('\n').map(line => line.split(' ')[0]).filter(Boolean);
    }

    res.json(impresoras);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al listar impresoras' });
  }
};

// Imprimir ticket
const imprimirTicket = async (req, res) => {
  const { texto, impresora } = req.body;

  try {
    let printer = new ThermalPrinter({
      type: PrinterTypes.EPSON, // o STAR según tu impresora
      interface: `printer:${impresora}`
    });

    const isConnected = await printer.isPrinterConnected();
    if (!isConnected) {
      return res.status(400).json({ mensaje: 'No se pudo conectar con la impresora' });
    }

    printer.println(texto);
    await printer.execute();

    res.json({ mensaje: 'Ticket enviado a la impresora' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al imprimir ticket' });
  }
};

module.exports = { listarImpresoras, imprimirTicket };
