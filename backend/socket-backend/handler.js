const AWS = require('aws-sdk')

const autoscale = new AWS.AutoScaling({
  region: process.env.REGION,
})
const ec2 = new AWS.EC2({
  region: process.env.REGION,
})
const r53 = new AWS.Route53()

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


module.exports.routeCheck = async (event, context) => {
  console.log('ayyyy')
  const AutoScalingGroupName = process.env.AUTOSCALE_NAME

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

  const hostedzoneid = process.env.HOSTED_ZONE
  const sitename = process.env.SITE_NAME
  console.log(sitename)
  console.log(hostedzoneid)
  console.log(myFriendsIps)
  const data2 = await changeResourceRecordSets(hostedzoneid, sitename, myFriendsIps)

  console.log(data2)
  return { statusCode: 200 }
}
