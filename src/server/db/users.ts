import { env } from "@/data/env/server";
import {
  CACHE_TAGS,
  dbCache,
  getUserTag,
  revalidateDbCache,
} from "@/lib/cache";
import { connectToDatabase } from "@/lib/mongoose";
import { UsersModel } from "@/models/User";
import { findUserById } from "../actions/ptero";

export async function setPassword(id: string, password: string) {
  const user = await findUserById(id);
  if (!user) return;

  const response = await fetch(
    `https://panel.hyperhostings.com/api/application/users/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${env.PANEL_API}`,
      },
      body: JSON.stringify({
        email: user.email,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        password,
      }),
    }
  );

  const result = await response.json();
  if (!result.errors) {
    await connectToDatabase();

    const updatedUser = await UsersModel.findOneAndUpdate(
      {
        pteroId: user.id,
      },
      {
        pteroPasswordSet: true,
      }
    );

    if (updatedUser) {
      revalidateDbCache({
        tag: CACHE_TAGS.users,
        userId: updatedUser.clerkUserId,
        _id: updatedUser._id,
      });
    }
  }
}

export async function deleteUser(clerkUserId: string) {
  await connectToDatabase();

  await UsersModel.deleteOne({
    clerkUserId,
  });

  revalidateDbCache({
    tag: CACHE_TAGS.users,
    userId: clerkUserId,
  });
}

export async function createUser(clerkUserId: string) {
  await connectToDatabase();

  const prevUser = await UsersModel.findOne({
    clerkUserId,
  });

  if (prevUser) return prevUser;

  const newUser = await new UsersModel({
    clerkUserId,
  }).save();

  if (newUser != null) {
    revalidateDbCache({
      tag: CACHE_TAGS.users,
      _id: newUser._id,
      userId: clerkUserId,
    });
  }

  return newUser;
}

export function getUser(clerUserId: string) {
  const cacheFn = dbCache(getUserInternal, {
    tags: [getUserTag(clerUserId, CACHE_TAGS.users)],
  });

  return cacheFn(clerUserId);
}

async function getUserInternal(clerkUserId: string) {
  await connectToDatabase();

  return await UsersModel.findOne({
    clerkUserId,
  });
}
