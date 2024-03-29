import { User, Post } from "../mongoDB/index.js";
import { throwErrorIfDataExists } from "../utils/throwErrorIfDataExists.js";
import { PostNotFoundError } from "../utils/CustomError.js";

class PersonService {
  // 참가자 추가 or 취소
  static async addPerson({ post_id, user_id }) {
    // 게시글 조회 by post_id
    const post = await Post.findByPostId(post_id);

    // 생성된 게시글이 존재하지 않다면 에러
    throwErrorIfDataExists(!post, PostNotFoundError);

    // 유저의 참여 여부 확인
    const participation = post.participants.find(
      (participant) => participant.id == user_id
    );

    const userObject = await User.findByIdToParticipate(user_id);
    if (
      post.station == "클린후기" ||
      (post.station == "모집완료" && !participation)
    ) {
      throw new Error("참여할 수 없는 게시글입니다.");
    } else if (
      (post.station == "모집완료" && participation) ||
      (post.station == "모집중" && participation)
    ) {
      const cancelParticipation = await Post.deleteParticipant({
        post_id,
        user_id,
      });
      return cancelParticipation;
    } else if (post.station == "모집중" && !participation) {
      const posterNewParticipant = await Post.addParticipant({
        post_id,
        userObject,
      });
      return posterNewParticipant;
    }
  }
}

export { PersonService };
