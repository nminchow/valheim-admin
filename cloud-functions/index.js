const Compute = require('@google-cloud/compute');
const { Logging } = require('@google-cloud/logging');
const compute = new Compute();
const logging = new Logging();

const zone = compute.zone('us-central1-c');
const vm = zone.vm('palworld');

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

const status = async ({res}) => {
  const statusResult = vm.get();
  const logResult = logging.getEntries({
    filter: 'resource.type="gce_instance" AND resource.labels.instance_id="5261484955356925592"',
    orderBy: 'timestamp desc',
    pageSize: 25,
  });

  [[_, vmStatus], [entries]] = await Promise.all([statusResult, logResult]);

  res.status(200).send({ vmStatus, entries });
}

exports.start = handlePublic(start);
exports.stop = handlePublic(stop);
exports.status = handlePublic(status);
