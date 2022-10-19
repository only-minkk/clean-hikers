import React, { useContext } from "react";

import { errorMessage } from "../common/form/Message";
import * as api from "../../api/api";

import { ProfileBlock, ImageBlock } from "./ProfileStyle";
import { ButtonBlock } from "../common/form/FormStyled";

import { Form, Input, Button, Avatar } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { DispatchContext, UserStateContext } from "../../App";

function ProfileEdit({ setIsEdit, user, setUser }) {
  const [form] = Form.useForm();
  const dispatch = useContext(DispatchContext);
  const userState = useContext(UserStateContext);

  function onImageChange(e) {
    e.preventDefault();
    const reader = new FileReader();
    const file = e.target.files[0];
    const isJpgOrPng =
      file.type === "image/jpg" ||
      file.type === "image/jpeg" ||
      file.type === "image/png";
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isJpgOrPng) {
      errorMessage("JPG/PNG 파일만 업로드 가능합니다");
    } else if (!isLt2M) {
      errorMessage("2MB 이하의 파일만 업로드 가능합니다");
    } else {
      if (reader !== undefined && file !== undefined) {
        reader.onloadend = () => {
          setUser((user) => ({ ...user, image: reader.result }));
          changeImage(reader.result);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  async function changeImage(url) {
    try {
      await api.put("user/picture", { image: url });
      dispatch({
        type: "IMAGE_CHANGE",
        payload: { ...userState.user, defaultImage: url },
      });
    } catch (e) {
      console.error(e);
    }
  }

  async function changeNickname() {
    if (user.nickname.length < 2 || user.nickname.length >= 10) {
      errorMessage("닉네임은 두 자 이상 열 자 이하로 입력해 주세요");
    } else if (/\s/.test(user.nickname)) {
      errorMessage("닉네임은 공백을 포함 할 수 없습니다");
    } else {
      try {
        await api.put("user/nickname", {
          nickname: user.nickname,
        });
      } catch (e) {
        console.error(e);
      }
    }
  }

  async function changePassword() {
    const regExp =
      /^[A-Za-z0-9`~!@#\$%\^&\*\(\)\{\}\[\]\-_=\+\\|;:'"<>,\./\?]{8,16}$/;
    if (!regExp.test(user.password)) {
      errorMessage(
        "비밀번호는 8~16자 영문 대 소문자, 숫자, 특수문자를 사용하세요"
      );
    } else {
      try {
        await api.put("user/password", {
          password: user.password,
        });
      } catch (e) {
        console.error(e);
      }
    }
  }

  async function deleteImage() {
    try {
      setUser((user) => ({ ...user, image: null }));
      await api.put("user/picture", {
        image: null,
      });
    } catch (e) {
      console.error(e);
    }
  }

  function onFinish() {
    setIsEdit(false);
  }

  return (
    <ProfileBlock>
      <h2>프로필 수정</h2>
      <Form form={form} initialValues={user}>
        <ImageBlock>
          <label htmlFor="file">
            <PlusOutlined className="uploadButton" />
            {user.image ? (
              <Avatar size={100} src={user.image} alt="profile_image" />
            ) : (
              <Avatar size={100} />
            )}
          </label>
          <input
            type="file"
            name="avatar"
            id="file"
            accept=".jpeg, .png, .jpg"
            onChange={onImageChange}
            src={user.image}
          />
          {user.image && (
            <button type="button" className="delete" onClick={deleteImage}>
              기본이미지로 변경
            </button>
          )}
        </ImageBlock>

        <Form.Item colon={false} label="닉네임" name="nickname">
          <Input.Group>
            <Input
              name="nickname"
              value={user.nickname}
              onChange={(e) => {
                setUser((prev) => ({ ...prev, nickname: e.target.value }));
              }}
            />
            <Button className="submitButton" onClick={changeNickname}>
              저장
            </Button>
          </Input.Group>
        </Form.Item>
        <Form.Item colon={false} label="비밀번호" name="password">
          <Input.Group>
            <Input.Password
              value={user.password}
              onChange={(e) => {
                setUser((prev) => ({ ...prev, password: e.target.value }));
              }}
            />
            <Button className="submitButton" onClick={changePassword}>
              저장
            </Button>
          </Input.Group>
        </Form.Item>
        <ButtonBlock className="smallButton" onClick={onFinish}>
          확인
        </ButtonBlock>
      </Form>
    </ProfileBlock>
  );
}

export default ProfileEdit;
