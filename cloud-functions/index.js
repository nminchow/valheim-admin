const Compute = require('@google-cloud/compute');
const compute = new Compute();
const zone = compute.zone('us-east4-c');
const vm = zone.vm('valheim-server');

const handleOptions = async (req, res, handler) => {
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    // Send response to OPTIONS requests
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600');
    res.status(204).send('');
    return;
  }
  await handler({req, res});
};

const handlePublic = (handler) => (req, res) => {
  handleOptions(req, res, handler);
};

const start = ({res}) => {
  vm.start().then(result =>
    res.status(200).send(result)
  );
};

const stop = ({res}) => {
  vm.stop().then(result =>
    res.status(200).send(result)
  );
};

const status = ({res}) => {
  vm.get().then(([_,status]) =>
    res.status(200).send(status)
  );
}

exports.start = handlePublic(start);
exports.stop = handlePublic(stop);
exports.status = handlePublic(status);
