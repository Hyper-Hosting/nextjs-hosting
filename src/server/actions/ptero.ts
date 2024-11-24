import { env } from "@/data/env/server";
import { getTierByName, TierNames } from "@/data/subscriptionTiers";
import { CACHE_TAGS, revalidateDbCache } from "@/lib/cache";
import { UsersModel } from "@/models/User";
import { clerkClient } from "@clerk/nextjs/server";

export async function createUser(clerkUserId: string) {
  const user = await clerkClient().users.getUser(clerkUserId);
  const email = user.emailAddresses[0].emailAddress;
  const username = email.split("@")[0];

  const response = await fetch(
    "https://panel.hyperhostings.com/api/application/users",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${env.PANEL_API}`,
      },
      body: JSON.stringify({
        email,
        username,
        first_name: user.firstName,
        last_name: user.lastName,
      }),
    }
  );

  const result = await response.json();
  let pteroId = 0;
  if (result.errors) {
    pteroId = await findUserByEmail(email);
  } else {
    pteroId = result.attributes.id;
  }

  const updatedUser = await UsersModel.findOneAndUpdate(
    {
      clerkUserId,
    },
    {
      pteroId,
    }
  );

  if (updatedUser) {
    revalidateDbCache({
      tag: CACHE_TAGS.users,
      userId: clerkUserId,
      _id: updatedUser._id,
    });
  }

  return pteroId.toString();
}

export async function findUserByEmail(email: string) {
  const response = await fetch(
    "https://panel.hyperhostings.com/api/application/users",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${env.PANEL_API}`,
      },
    }
  );

  const result = await response.json();

  if (result.data) {
    for (const user of result.data) {
      if (user.attributes.email == email) {
        return user.attributes.id;
      }
    }
  }

  return 0;
}

export async function createServer(pteroId: string, tierName: TierNames) {
  const tier = getTierByName(tierName);
  const allocation = await getFreeAllocation();

  const response = await fetch(
    "https://panel.hyperhostings.com/api/application/servers",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${env.PANEL_API}`,
      },
      body: JSON.stringify({
        name: "New Server",
        user: pteroId,
        egg: 15,
        docker_image: "ghcr.io/parkervcp/yolks:nodejs_20",
        startup:
          'if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z ${NODE_PACKAGES} ]]; then /usr/local/bin/npm install ${NODE_PACKAGES}; fi; if [[ ! -z ${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall ${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi; if [[ "${MAIN_FILE}" == "*.js" ]]; then /usr/local/bin/node "/home/container/${MAIN_FILE}" ${NODE_ARGS}; else /usr/local/bin/ts-node --esm "/home/container/${MAIN_FILE}" ${NODE_ARGS}; fi',
        environment: {
          USER_UPLOAD: true,
          AUTO_UPDATE: false,
          JS_FILE: "index.js",
          MAIN_FILE: "index.js",
        },
        limits: {
          memory: tier?.memory,
          swap: 0,
          disk: tier?.diskSpace,
          io: 500,
          cpu: 100,
        },
        feature_limits: {
          databases: 0,
          backups: tier?.backups || 0,
        },
        allocation: {
          default: allocation,
        },
      }),
    }
  );

  const result = await response.json();

  return {
    url: `https://panel.hyperhostings.com/server/${result.attributes.identifier}`,
    id: result.attributes.id,
    identifier: result.attributes.identifier,
  };
}

export async function getFreeAllocation() {
  const response = await fetch(
    "https://panel.hyperhostings.com/api/application/nodes/2/allocations",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${env.PANEL_API}`,
      },
    }
  );

  const result = await response.json();
  let allocation = null;

  for (const data of result.data) {
    if (!data.attributes.assigned) {
      allocation = data.attributes.id;
      break;
    }
  }

  return allocation;
}
