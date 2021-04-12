exports.handler = (event: any) => {
    const res = JSON.stringify(event.Records.map((item: any)=> Object.entries(item.dynamodb.NewImage) ))
    console.log(res)
}