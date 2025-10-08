import { ESPLoader } from 'https://cdn.skypack.dev/esptool-js';
import { Transport } from 'https://cdn.skypack.dev/esptool-js/serial.js';

let transport, chip, esp;

async function connect() {
  const port = await navigator.serial.requestPort({ filters: [{ usbVendorId: 0x10c4 }] });
  await port.open({ baudRate: 921600 });
  transport = new Transport(port);
  esp = new ESPLoader(transport, 921600, console.log);
  await esp.initialize();
  chip = await esp.chipName();
  console.log('Chip:', chip);
}

async function dumpFlash(sizeBytes = 0x400000) {
  const step = 0x10000; // 64 kB
  const chunks = [];
  for (let off = 0; off < sizeBytes; off += step) {
    const len = Math.min(step, sizeBytes - off);
    const data = await esp.readFlash(off, len);
    chunks.push(data);
    updateProgress((off + len) / sizeBytes);
  }
  const blob = new Blob(chunks, { type: 'application/octet-stream' });
  saveAs(blob, `dump_${chip}_${Date.now()}.bin`);
  return blob;
}
