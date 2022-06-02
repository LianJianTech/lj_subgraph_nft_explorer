import {ipfs, json, log} from "@graphprotocol/graph-ts"
import {NFTExplorer, Transfer} from "../generated/NFTExplorer/NFTExplorer"
import {MyMetaData, MyTransfer} from "../generated/schema";

export function handleTransfer(event: Transfer): void {
    const myTransfer = new MyTransfer(event.transaction.hash.toHexString());
    myTransfer.from = event.params.from;
    myTransfer.to = event.params.to;
    myTransfer.tokenId = event.params.tokenId;

    const contract = NFTExplorer.bind(event.address);
    //合约交互 获取tokenURI
    myTransfer.tokenURI = contract.tokenURI(event.params.tokenId);
    //数据存储
    myTransfer.save();
    log.info('myTransfer id is {}', [myTransfer.id]);

    const ipfsPath = myTransfer.tokenURI;
    log.info('ipfsPath is {}', [ipfsPath]);
    //获取metadata数据
    const data = ipfs.cat(ipfsPath)
    if (!data) {
        return;
    }
    log.info('data is {}', [data.toString()]);

    const myMeta = new MyMetaData(myTransfer.tokenId.toString());
    //转换为json格式
    const value = json.fromBytes(data);
    const obj = value.toObject();
    if (obj != null) {
        //解析name
        const name = obj.get("name")
        if (name != null) {
            myMeta.name = name.toString();
        }
        //解析image
        const image = obj.get("image")
        if (image != null) {
            myMeta.image = image.toString();
        }
    }
    myMeta.owner = myTransfer.to;
    //数据存储
    myMeta.save();
    log.info('meta id is {}', [myMeta.id]);
}
