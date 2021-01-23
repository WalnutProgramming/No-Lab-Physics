const { nanoid } = require("nanoid");

const theObject = {"allObjects":[{"mass":"$number::Infinity","loc":{"$c":"Vector","a":[550,618.0654338549076,0]},"vel":{"$c":"Vector","a":[0,0,0]},"acc":{"$c":"Vector","a":[0,0,0]},"hasGravity":false,"id":"iaZzQtlR-QhpuK0uXX-x1","width":1100,"height":10,"$c":"BoxMover"},{"mass":"$number::Infinity","loc":{"$c":"Vector","a":[550,0,0]},"vel":{"$c":"Vector","a":[0,0,0]},"acc":{"$c":"Vector","a":[0,0,0]},"hasGravity":false,"id":"6Zr82FUiD97mtGFQy7EcC","width":1100,"height":10,"$c":"BoxMover"},{"mass":"$number::Infinity","loc":{"$c":"Vector","a":[0,309.0327169274538,0]},"vel":{"$c":"Vector","a":[0,0,0]},"acc":{"$c":"Vector","a":[0,0,0]},"hasGravity":false,"id":"u2cYTwptOuptPe_DNqrBv","width":10,"height":618.0654338549076,"$c":"BoxMover"},{"mass":"$number::Infinity","loc":{"$c":"Vector","a":[1100,309.0327169274538,0]},"vel":{"$c":"Vector","a":[0,0,0]},"acc":{"$c":"Vector","a":[0,0,0]},"hasGravity":false,"id":"19eP13e0wuyPQM1KUuLOm","width":10,"height":618.0654338549076,"$c":"BoxMover"},{"mass":2.1303215717147754,"loc":{"$c":"Vector","a":[847.6203901903509,309.0327169274538,0]},"vel":{"$c":"Vector","a":[0,0,0]},"acc":{"$c":"Vector","a":[0,0,0]},"hasGravity":true,"id":"bdt1xFYNZbon3S-hy8GoI","radius":21.303215717147754,"$c":"CircleMover"},{"mass":2.173653122841227,"loc":{"$c":"Vector","a":[181.24298955407053,309.0327169274538,0]},"vel":{"$c":"Vector","a":[0,0,0]},"acc":{"$c":"Vector","a":[0,0,0]},"hasGravity":true,"id":"ewd-VV8QdhHaJF-6bGjpy","radius":21.736531228412268,"$c":"CircleMover"},{"mass":1.6932102556113606,"loc":{"$c":"Vector","a":[981.603814153159,309.0327169274538,0]},"vel":{"$c":"Vector","a":[0,0,0]},"acc":{"$c":"Vector","a":[0,0,0]},"hasGravity":true,"id":"J8uspSnINfbI2sQqzNZpM","radius":16.932102556113605,"$c":"CircleMover"},{"mass":2.2127864607567713,"loc":{"$c":"Vector","a":[87.36916477252855,309.0327169274538,0]},"vel":{"$c":"Vector","a":[0,0,0]},"acc":{"$c":"Vector","a":[0,0,0]},"hasGravity":true,"id":"iXbs1Dx_ZFJJF8e9yOhem","radius":22.127864607567712,"$c":"CircleMover"},{"mass":2.5831551192581452,"loc":{"$c":"Vector","a":[982.5906155592788,309.0327169274538,0]},"vel":{"$c":"Vector","a":[0,0,0]},"acc":{"$c":"Vector","a":[0,0,0]},"hasGravity":true,"id":"uHbU6s8qGq43G09xOJitH","radius":25.83155119258145,"$c":"CircleMover"},{"mass":2.6772350566245455,"loc":{"$c":"Vector","a":[323.81177762328156,309.0327169274538,0]},"vel":{"$c":"Vector","a":[0,0,0]},"acc":{"$c":"Vector","a":[0,0,0]},"hasGravity":true,"id":"vHHl6tfTtlxRkG4jZvNEA","radius":26.772350566245457,"$c":"CircleMover"}]}

exports.handler = async function (event, context) {
	if (event.httpMethod === 'POST') {
    const id = nanoid();
    
    return {
      statusCode: 200,
      body: JSON.stringify({ id }),
    }
  }
  return {
    statusCode: 200,
    body: JSON.stringify({ state: theObject }),
  };
};
