from sepal_ui import sepalwidgets as sw
from sepal_ui.scripts import utils as su

from component import parameter as cp


class CustomAssetSelect(sw.AssetSelect):
    @su.switch("loading")
    def _validate(self, change):

        super()._validate(change)

        # if the select asset is one of the default one the keep it
        if change["new"] in cp.forest_map:
            self.error_messages = None
            self.error = False

        return self
