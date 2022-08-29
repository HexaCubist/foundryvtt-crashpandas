/**
 * Extend the basic ActorSheet
 * @extends {ActorSheet}
 */

export class HoneyHeistActorSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["honeyheist", "sheet", "actor"],
      template: "systems/crash-pandas/templates/actor-sheet.html",
      width: 500,
      height: 550,
    });
  }

  /** @override */
  getData(options) {
    let baseData = super.getData(options);
    let sheetData = {};
    sheetData = baseData.data; // needed to handle the new 0.8.x data depth
    if (isNewerVersion(game.data.version, "0.8.0")) {
      sheetData.actor = this.actor.data.toObject(false); // needed for actor.x handlebars
      sheetData.editable = this.options.editable; // needed to fix TinyMCE due to missing editable parameter
      return sheetData;
    } else {
      return baseData;
    }
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    html.find(".attribute-roll").click(async (ev) => {
      const roller = $(ev.currentTarget);
      const roll = new Roll(
        roller.data("roll"),
        this.actor.getRollData()
      ).evaluate({ async: false }); // avoid deprecation warning, backwards compatible
      const parent = roller.parent("div");
      const label = parent.find("label").get(0).innerText;
      const select = parent.find("select").get(0);
      const attributeName = select.name;
      const option = select.options[roll.total - 1];

      await this.actor.update({ [attributeName]: option.value });

      // If you roll an 8 on a hat roll, you get two hats!
      if (attributeName === "data.hat" && roll.total === 9) {
        $(".hat2").show();
        roll.toMessage({
          user: game.user.id, // avoid deprecation warning, backwards compatible
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
          content: `<h2>${label} Roll</h2><h3>${option.innerText} You get two hats!!</h3>`,
        });
      } else {
        roll.toMessage({
          user: game.user.id, // avoid deprecation warning, backwards compatible
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
          content: `<h2>${label} Roll</h2><h3>${option.innerText}</h3>`,
        });
      }
    });

    html.find(".stat-roll-single, .stat-roll-double").click(async (ev) => {
      const roller = $(ev.currentTarget);
      const roll = new Roll(
        roller.data("roll"),
        this.actor.getRollData()
      ).evaluate({ async: false }); // avoid deprecation warning, backwards compatible

      roll.toMessage({
        user: game.user.id, // avoid deprecation warning, backwards compatible
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: "",
      });
    });
  }
}
