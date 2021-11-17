from sepal_ui import sepalwidgets as sw
import ipyvuetify as v

from .time_tile import TimeTile
from .sensor_tile import SensorTile
from .basemap_tile import BasemapTile
from .fcdm_tile import FcdmTile
from .launch_tile import LaunchTile

from component.message import cm


class QuestionnaireTile(sw.Tile):
    def __init__(self, aoi_model, model, result_tile):

        # build the tiles
        time_tile = (TimeTile(model),)
        sensor_tile = (SensorTile(model),)
        basemap_tile = (BasemapTile(model),)
        input_tile = FcdmTile(model)
        launch_tile = LaunchTile(aoi_model, model, result_tile)

        tiles = [time_tile, sensor_tile, basemap_tile, input_tile, launch_tile]

        # build the content and the stepper header
        step_content = []
        stepper_children = []
        for i, tile in enumerate(tiles):

            # for no reason the tiles are sometimes embed in a len 1 tuple
            tile = tile if type(tile) != tuple else tile[0]

            # build the stepper
            stepper_children.append(
                v.StepperStep(
                    key=i + 1,
                    complete=False,
                    step=i + 1,
                    editable=True,
                    children=[tile.get_title()],
                )
            )
            stepper_children.append(v.Divider())

            # build the content
            step_content.append(
                v.StepperContent(key=i + 1, step=i + 1, children=[tile])
            )

        # remove the last divider
        stepper_children.pop()

        # build the stepper
        stepper = v.Stepper(
            class_="mt-2",
            children=[
                v.StepperHeader(children=stepper_children),
                v.StepperItems(children=step_content),
            ],
        )

        # build the tile
        super().__init__("questionnaire_tile", cm.tile.questionnaire, inputs=[stepper])
