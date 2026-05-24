import PlayerController from './PlayerController';

const { ccclass } = cc._decorator;

@ccclass
export default class QuestionBlock extends cc.Component {
    private spawner: any = null;
    private used = false;
    private readonly bottomHitTolerance = 6;
    private hitHorizontalInset = 4;

    setup(spawner: any, hitHorizontalInset: number = 4) {
        this.spawner = spawner;
        this.hitHorizontalInset = Math.max(0, hitHorizontalInset);
    }

    markUsed() {
        this.used = true;
    }

    onPreSolve(contact: cc.PhysicsContact, selfCollider: cc.Collider, otherCollider: cc.Collider) {
        if (this.used || !this.spawner || !otherCollider || !otherCollider.node) {
            return;
        }

        if (!otherCollider.node.getComponent(PlayerController)) {
            return;
        }

        if (!this.isHitFromBelow(selfCollider, otherCollider)) {
            return;
        }

        this.used = true;
        this.spawner.hitQuestionBlock(this.node);
    }

    private isHitFromBelow(selfCollider: cc.Collider, otherCollider: cc.Collider) {
        const body = otherCollider.node.getComponent(cc.RigidBody);
        if (body && body.linearVelocity.y <= 0) {
            return false;
        }

        const blockRect = this.getWorldRect(selfCollider);
        const playerRect = this.getWorldRect(otherCollider);
        const hitLeft = blockRect.left + this.hitHorizontalInset;
        const hitRight = blockRect.right - this.hitHorizontalInset;
        const centeredUnderBlock = playerRect.centerX >= hitLeft && playerRect.centerX <= hitRight;
        const playerBelowBlock = playerRect.centerY < blockRect.centerY;
        const closeToBottom = playerRect.top <= blockRect.bottom + this.bottomHitTolerance;

        return centeredUnderBlock && playerBelowBlock && closeToBottom;
    }

    private getWorldRect(collider: cc.Collider) {
        const node = collider.node;
        const offset = (collider as any).offset || cc.v2(0, 0);
        const size = (collider as any).size || node.getContentSize();
        const bottomLeft = node.convertToWorldSpaceAR(cc.v2(
            offset.x - size.width * 0.5,
            offset.y - size.height * 0.5
        ));
        const topRight = node.convertToWorldSpaceAR(cc.v2(
            offset.x + size.width * 0.5,
            offset.y + size.height * 0.5
        ));
        const left = Math.min(bottomLeft.x, topRight.x);
        const right = Math.max(bottomLeft.x, topRight.x);
        const bottom = Math.min(bottomLeft.y, topRight.y);
        const top = Math.max(bottomLeft.y, topRight.y);

        return {
            left,
            right,
            bottom,
            top,
            centerX: (left + right) * 0.5,
            centerY: (bottom + top) * 0.5
        };
    }
}
