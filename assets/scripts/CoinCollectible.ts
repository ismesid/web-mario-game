import PlayerController from './PlayerController';

const { ccclass } = cc._decorator;

@ccclass
export default class CoinCollectible extends cc.Component {
    private spawner: any = null;
    private collected = false;

    setup(spawner: any) {
        this.spawner = spawner;
    }

    onBeginContact(contact: cc.PhysicsContact, selfCollider: cc.Collider, otherCollider: cc.Collider) {
        if (this.collected || !this.spawner || !otherCollider || !otherCollider.node) {
            return;
        }

        if (!otherCollider.node.getComponent(PlayerController)) {
            return;
        }

        this.collected = true;
        this.spawner.collectCoin(this.node);
    }
}
