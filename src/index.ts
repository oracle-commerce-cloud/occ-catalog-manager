import "module-alias/register";
import ora, { Ora } from "ora";
import * as fs from "fs";
import chalk from "chalk";
import FileHound from "filehound";

import { useApi } from "~/api";
import { InvalidCredentials } from "~/errors/InvalidCredentials";
import { useCommonder } from "~/helpers/useCommander";
import { authLoader } from "~/helpers/authLoader";
import { useTranslate } from "~/helpers/useTranslate";
import { t } from "~/locales/translate";

import { CollectionBody } from "~/types/api/collection";
import { async } from "rxjs/internal/scheduler/async";
import Listr from "listr";

const program = useCommonder();
const resources = useTranslate(program.locale || "en");
const loader = authLoader(ora(), 8);
const { login, createCollection, updateCollection } = useApi(program);

async function chunksSequence(chunks: any[]) {
  const tasks = chunks.map(chunk => ({
    title: `${chunk.type} ${chunk.item.properties.id} for ${chunk.locale}`,
    task: async (ctx: any, task: any) => {
      ctx.results = [
        ...(ctx.results || []),
        {
          ...chunk,
          item: await chunk.action(task),
          action: undefined,
        },
      ];
    },
  }));
  const { results } = await new Listr(tasks, { exitOnError: false }).run();
  console.log({ results: results.length });
  return results;
}

const main = async () => {
  if (!program.node || !program.applicationKey) {
    throw new InvalidCredentials(t("Incorrect applicationKey or node."));
  }
  const token = await login();
  loader.loginSucceed();

  const images = FileHound.create()
    .path(program.path)
    .ext(".json")
    .findSync();

  loader.succeed();

  try {
    const oprerations = images.map(file => {
      if (file.includes("collections")) {
        console.log(file);
        try {
          const { locale: language, items } = JSON.parse(fs.readFileSync(file) as any);
          const locale = language.toLowerCase().trim();
          const itemsCount = items.length;
          return {
            locale,
            items: items.map((collection: CollectionBody, index: number) => ({
              file,
              locale,
              itemsCount,
              position: index,
              type: "collection",
              item: collection,
              action: async (task: any) => {
                const { repositoryId } = collection;
                const result = await (repositoryId || locale !== "en"
                  ? updateCollection(repositoryId || collection.properties.id, { language: locale, collection })
                  : createCollection({ language: locale, collection })
                ).catch(e => {
                  return new Error(e.response.data.message);
                });

                const newValue =
                  result instanceof Error
                    ? undefined
                    : (() => {
                        delete result.childCategories;
                        delete result.links;
                        return {
                          ...collection,
                          repositoryId: result.repositoryId,
                        };
                      })();

                if (newValue) {
                  if (task) {
                    task.title = `${collection.properties.id} has been updated`;
                  } else {
                    console.log(`  ${chalk.green(`✔`)} ${collection.properties.id} has been updated`);
                  }
                } else {
                  if (task) {
                    task.skip(`${collection.properties.id}: ${result}`);
                  }
                  console.error(`${chalk.red(`✖`)} ${collection.properties.id}: ${result}`);
                }
                return newValue || collection;
              },
            })),
          };
        } catch (e) {
          throw e;
        }
      }
    });

    const byLocale = oprerations.reduce((prev: any, curen) => {
      return {
        ...prev,
        [curen.locale]: [...(prev[curen.locale] || []), ...curen.items],
      };
    }, {});
    // console.log(byLocale);
    console.log("============================");
    const c = byLocale.ja;
    let d: any[] = [];
    let b: any[] = [];
    console.log({ b, l: b.length, c: c.length, d: d.length });
    console.log("============================");

    while (b.length < c.length) {
      d = c.filter(
        ({ item }: any) =>
          (!item.parentCategoryIds || item.parentCategoryIds.every((id: string) => b.includes(id))) &&
          !b.includes(item.properties.id),
      );
      d = d.length ? d : c.filter(({ item }: any) => !b.includes(item.properties.id));
      b = b.concat(d.map(({ item }: any) => item.properties.id));
      await chunksSequence(d);
      console.log("============================");
      console.log({ l: b.length, c: c.length, d: d.length });
      console.log("============================");
    }
  } catch (e) {
    throw e;
  }

  const instances: any = undefined;
  return {
    token,
    instances,
  };
};

main()
  .catch(() => {
    throw new InvalidCredentials(t("Incorrect applicationKey or node."));
  })
  .then(({ instances }) => console.log(instances))
  .then(() => loader.allDone())
  .catch((err: any) => loader.fail(err.name));
