from sepal_ui.mapping import SepalMap
from sepal_ui import sepalwidgets as sw
from ipyleaflet import WidgetControl
from traitlets import Unicode

__all__ = ["CustomMap"]


class StateBar(sw.StateBar):
    _name = Unicode("").tag(sync=True)

    def __init__(self, name="layer", **kwargs):
        super().__init__(**kwargs)

        self.msg = f"Loading {name}"
        self.loading = False
        self._name = name

    def activate(self, change):
        if change["new"]:
            self.show()
        else:
            self.hide()

        return


class CustomMap(SepalMap):
    layer_state_list = []

    def add_layer(self, l):
        # call the original function
        super().add_layer(l)

        # add a layer state object
        state = StateBar(name=l.name)
        self.layer_state_list += [state]
        self.add_control(WidgetControl(widget=state, position="topleft"))

        # link it to the layer state
        # layer = next(l for l in self.layers if l.name == name)
        l.observe(state.activate, "loading")

        return

    def remove_layer(self, l):
        # call the original function
        super().remove_layer(l)

        # search for the coresponding state bar
        state = next(s for s in self.layer_state_list if s._metadata["layer"] == l.name)

        # remove it
        self.layer_state_list.remove(state)

        return
