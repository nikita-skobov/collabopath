const request = require('request')
const AWS = require('aws-sdk')
const myconfig = require('./myconfig.json')

const autoscale = new AWS.AutoScaling({
  region: myconfig.region,
})
const ec2 = new AWS.EC2({
  region: myconfig.region,
})
const r53 = new AWS.Route53()

function getMetaData(type) {
  return new Promise((res, rej) => {
    request(`http://169.254.169.254/latest/${type}`, (err, resp, body) => {
      if (err) return rej(err)
      return res(body)
    })
  })
}

function describeInstances(ids) {
  return new Promise((res, rej) => {
    const params = {
      InstanceIds: ids,
    }

    ec2.describeInstances(params, (err, data) => {
      if (err) return rej(err)
      return res(data)
    })
  })
}

function describeAutoScalingGroups(name) {
  return new Promise((res, rej) => {
    const params = {
      AutoScalingGroupNames: [name],
    }
    autoscale.describeAutoScalingGroups(params, (err, data) => {
      if (err) return rej(err)
      return res(data)
    })
  })
}

function describeAutoScalingInstances(id) {
  return new Promise((res, rej) => {
    const params = {
      InstanceIds: [id],
    }
    autoscale.describeAutoScalingInstances(params, (err, data) => {
      if (err) return rej(err)
      return res(data)
    })
  })
}

function changeResourceRecordSets(HostedZoneId, Name, ips) {
  return new Promise((res, rej) => {
    const params = {
      ChangeBatch: {
        Changes: [
          {
            Action: 'UPSERT',
            ResourceRecordSet: {
              Name,
              ResourceRecords: ips.map(ip => ({ Value: ip })),
              TTL: 60,
              Type: 'A',
            },
          },
        ],
      },
      HostedZoneId,
    }

    r53.changeResourceRecordSets(params, (err, data) => {
      if (err) return rej(err)
      return res(data)
    })
  })
}

async function main() {
  const myInstanceId = await getMetaData('meta-data/instance-id')
  const myPublicIp = await getMetaData('meta-data/public-ipv4')
  const instanceData = await describeAutoScalingInstances(myInstanceId)
  const { AutoScalingGroupName } = instanceData.AutoScalingInstances[0]
  const autoScaleData = await describeAutoScalingGroups(AutoScalingGroupName)
  const instances = autoScaleData.AutoScalingGroups[0].Instances

  const ids = []
  const myFriendsIps = []

  instances.forEach(({ InstanceId }) => {
    ids.push(InstanceId)
  })

  const data = await describeInstances(ids)
  const instances2 = []
  data.Reservations.forEach(({ Instances }) => {
    Instances.forEach(obj => instances2.push(obj))
  })

  instances2.forEach(({ PublicIpAddress }) => {
    myFriendsIps.push(PublicIpAddress)
  })

  console.log(ids)
  console.log(myPublicIp)
  console.log(myInstanceId)
  console.log(AutoScalingGroupName)
  console.log(myFriendsIps)

  const { hostedzoneid, sitename } = myconfig
  const data2 = await changeResourceRecordSets(hostedzoneid, sitename, myFriendsIps)
  console.log(data2)
}

main()

module.exports.getMetaData = getMetaData
module.exports.describeInstances = describeInstances
module.exports.describeAutoScalingGroups = describeAutoScalingGroups
module.exports.describeAutoScalingInstances = describeAutoScalingInstances
