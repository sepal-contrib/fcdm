from datetime import datetime as dt

from sepal_ui import sepalwidgets as sw
import ipyvuetify as v

from component import parameter as cp
from component.message import cm


class SensorTile(sw.Tile):
    def __init__(self, model):

        # create adjustable variables end and start
        self.end = dt.now().year
        self.start = 1950  # prior to any sats

        # create the widgets
        self.sensors_select = v.Select(
            label=cm.input_lbl.sensor,
            items=[],
            v_model=[],
            multiple=True,
            chips=True,
            deletable_chips=True,
        )
        landsat_7_switch = v.Switch(
            label=cm.input_lbl.do_threshold, v_model=model.improve_L7
        )
        landsat_7_slider = v.Slider(
            class_="mt-5",
            label=cm.input_lbl.threshold,
            min=0,
            max=0.3,
            step=0.001,
            v_model=model.improve_threshold,
            thumb_label="always",
        )
        cloud_buffer = v.Slider(
            class_="mt-5",
            label=cm.input_lbl.cloud_buffer,
            min=0,
            max=2500,
            step=10,
            v_model=model.cloud_buffer,
            thumb_label="always",
        )

        # bind them to io
        model.bind(self.sensors_select, "sensors",).bind(
            landsat_7_switch,
            "improve_L7",
        ).bind(landsat_7_slider, "improve_threshold",).bind(
            cloud_buffer,
            "cloud_buffer",
        )

        super().__init__(
            "nested_widget",
            cm.tile.sensor,
            inputs=[
                self.sensors_select,
                landsat_7_switch,
                landsat_7_slider,
                cloud_buffer,
            ],
            alert=sw.Alert(),
        )

        # add js behaviour
        self.sensors_select.observe(self._check_sensor, "v_model")
        model.observe(self._change_start, "reference_start")
        model.observe(self._change_end, "analysis_end")

    def _check_sensor(self, change):
        """
        prevent users from selecting landsat and sentinel 2 sensors
        provide a warning message to help understanding
        """

        # exit if its a removal
        if len(change["new"]) < len(change["old"]):
            self.alert.reset()
            return self

        # use positionning in the list as boolean value
        sensors = ["landsat", "sentinel"]

        # guess the new input
        new_value = list(set(change["new"]) - set(change["old"]))[0]

        id_ = next(i for i, s in enumerate(sensors) if s in new_value)

        if sensors[id_] in new_value:
            if any(sensors[not id_] in s for s in change["old"]):
                change["owner"].v_model = [new_value]
                self.alert.add_live_msg(cm.no_mix, "warning")
            else:
                self.alert.reset()

        return self

    def _change_end(self, change):

        self.end = int(change["new"][:4]) if change["new"] else dt.now().year

        self._check_sensor_availability()

        return self

    def _change_start(self, change):

        self.start = int(change["new"][:4]) if change["new"] else 1950

        self._check_sensor_availability()

        return self

    def _check_sensor_availability(self):
        """reduce the number of available satellites based on the dates selected by the user"""

        # reset current values
        self.sensors_select.items = []
        self.sensors_select.v_model = []

        # check every satellite availability
        years = range(self.start, self.end + 1)
        sensors = []
        for s in cp.sensors:
            if any(e in years for e in [cp.sensors[s]["start"], cp.sensors[s]["end"]]):
                sensors.append(s)
            elif (
                cp.sensors[s]["start"] < self.start and cp.sensors[s]["end"] > self.end
            ):
                sensors.append(s)

        self.sensors_select.items = sensors

        return self
